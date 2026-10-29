"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, getCurrentUser, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { one, run } from "@/lib/db";
import { firstItemId, getEnrollment, markItemComplete } from "@/lib/queries";
import { STUDY_LEVELS } from "@/lib/seed-data";
import { TP_TEXT_MAX, TP_TEXT_MIN, getSubmission, safeLink, saveSubmission } from "@/lib/tp";

export type FormState = { error?: string } | undefined;

// Seuls les chemins internes sont acceptés comme destination après connexion.
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/mon-apprentissage";
}

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const field = (key: string) => String(formData.get(key) ?? "").trim();
  const firstName = field("first_name");
  const lastName = field("last_name");
  const university = field("university") === "autre" ? field("university_other") : field("university");
  const program = field("program");
  const level = field("study_level");
  const email = field("email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (lastName.length < 2) return { error: "Indiquez votre nom." };
  if (firstName.length < 2) return { error: "Indiquez votre prénom." };
  if (university.length < 2) return { error: "Indiquez votre université ou établissement." };
  if (program.length < 2) return { error: "Indiquez votre parcours (par exemple : Langues et Communication numérique)." };
  if (!(STUDY_LEVELS as readonly string[]).includes(level)) return { error: "Choisissez votre niveau d'études." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Adresse e-mail invalide." };
  if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  if (one("SELECT 1 FROM users WHERE email = ?", email)) return { error: "Un compte existe déjà avec cette adresse." };

  const userId = Number(
    run(
      "INSERT INTO users (name, email, password_hash, first_name, last_name, university, program, study_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      `${firstName} ${lastName}`, email, hashPassword(password), firstName, lastName, university, program, level,
    ).lastInsertRowid,
  );
  await createSession(userId);
  redirect(safeNext(formData.get("suite")));
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = one<{ id: number; password_hash: string }>("SELECT id, password_hash FROM users WHERE email = ?", email);
  if (!user || !verifyPassword(password, user.password_hash)) return { error: "E-mail ou mot de passe incorrect." };
  await createSession(user.id);
  redirect(safeNext(formData.get("suite")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function enroll(courseId: number, slug: string) {
  const user = await requireUser(`/cours/${slug}`);
  if (!one("SELECT 1 FROM courses WHERE id = ? AND status = 'published'", courseId)) redirect(`/cours/${slug}`);
  run("INSERT OR IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)", user.id, courseId);
  revalidatePath("/", "layout");
  redirect(`/cours/${slug}/apprendre/${firstItemId(courseId)}`);
}

export async function toggleSave(courseId: number, slug: string) {
  const user = await requireUser(`/cours/${slug}`);
  const removed = run("DELETE FROM saved WHERE user_id = ? AND course_id = ?", user.id, courseId);
  if (removed.changes === 0) run("INSERT INTO saved (user_id, course_id) VALUES (?, ?)", user.id, courseId);
  revalidatePath("/", "layout");
}

export async function completeItem(itemId: number, slug: string, nextItemId: number | null) {
  const user = await requireUser();
  const course = one<{ course_id: number }>("SELECT m.course_id FROM items i JOIN modules m ON m.id = i.module_id WHERE i.id = ?", itemId);
  if (!course || !getEnrollment(user.id, course.course_id)) redirect(`/cours/${slug}`);
  markItemComplete(user.id, itemId);
  revalidatePath("/", "layout");
  redirect(nextItemId ? `/cours/${slug}/apprendre/${nextItemId}` : `/cours/${slug}/apprendre/${itemId}`);
}

export async function submitTp(itemId: number, slug: string, _: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser(`/cours/${slug}`);
  const item = one<{ course_id: number; status: string }>(
    "SELECT m.course_id, c.status FROM items i JOIN modules m ON m.id = i.module_id JOIN courses c ON c.id = m.course_id WHERE i.id = ? AND i.kind = 'tp'",
    itemId,
  );
  if (!item || item.status !== "published" || !getEnrollment(user.id, item.course_id)) return { error: "Inscrivez-vous au cours pour rendre ce TP." };
  if (getSubmission(itemId, user.id)?.grade != null) return { error: "Ce TP a déjà été corrigé : il ne peut plus être modifié." };
  const text = String(formData.get("text") ?? "").trim();
  const link = safeLink(String(formData.get("link") ?? "").trim());
  if (text.length < TP_TEXT_MIN) return { error: `Votre rendu doit contenir au moins ${TP_TEXT_MIN} caractères.` };
  if (text.length > TP_TEXT_MAX) return { error: "Votre rendu est trop long (20 000 caractères maximum)." };
  if (link === undefined) return { error: "Le lien doit commencer par https:// (Google Drive, Docs…)." };
  saveSubmission(itemId, user.id, text, link);
  markItemComplete(user.id, itemId);
  revalidatePath("/", "layout");
  return {};
}

export async function submitReview(courseId: number, slug: string, _: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Connectez-vous pour laisser un avis." };
  if (!getEnrollment(user.id, courseId)) return { error: "Inscrivez-vous au cours pour laisser un avis." };
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();
  if (!(rating >= 1 && rating <= 5)) return { error: "Choisissez une note de 1 à 5." };
  if (comment.length < 10) return { error: "Votre avis doit contenir au moins 10 caractères." };
  run(
    `INSERT INTO reviews (user_id, course_id, rating, comment) VALUES (?, ?, ?, ?)
     ON CONFLICT (user_id, course_id) DO UPDATE SET rating = excluded.rating, comment = excluded.comment, created_at = datetime('now')`,
    user.id, courseId, rating, comment,
  );
  revalidatePath(`/cours/${slug}`);
  return {};
}

export async function setWeeklyGoal(formData: FormData) {
  const user = await requireUser();
  const goal = Math.min(7, Math.max(1, Number(formData.get("goal")) || 3));
  run("UPDATE users SET weekly_goal = ? WHERE id = ?", goal, user.id);
  revalidatePath("/mon-apprentissage");
}
