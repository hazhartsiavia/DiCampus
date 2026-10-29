"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/actions";
import { requireAdmin, requireTeacher, requireUser, type User } from "@/lib/auth";
import { one, run, type QuizQuestion } from "@/lib/db";
import { LEVELS } from "@/lib/seed-data";
import {
  courseIdOfItem, courseIdOfModule, getEditableCourse, getTeacherRequest, instructorIdFor,
  nextPosition, slugify, swapPosition, videoEmbed,
} from "@/lib/teaching";
import { gradeSubmission } from "@/lib/tp";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function lines(value: string) {
  return value.split("\n").map((l) => l.trim()).filter(Boolean);
}

function refresh() {
  revalidatePath("/", "layout");
}

/** Arrête l'action si l'utilisateur ne peut pas modifier ce cours. */
function assertCourse(user: User, courseId: number | undefined) {
  const course = courseId ? getEditableCourse(courseId, user) : undefined;
  if (!course) redirect("/enseignant");
  return course;
}

// ---------- Demandes d'accès ----------

export async function requestTeacherAccess(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/enseignant");
  if (user.role === "teacher") redirect("/enseignant");
  const partnerId = Number(formData.get("partner"));
  const message = text(formData, "message");
  if (!one("SELECT 1 FROM partners WHERE id = ?", partnerId)) return { error: "Choisissez votre établissement." };
  if (message.length < 20) return { error: "Présentez-vous en quelques phrases (20 caractères minimum)." };
  const existing = getTeacherRequest(user.id);
  if (existing?.status === "pending") return { error: "Votre demande est déjà en cours d'examen." };
  run(
    `INSERT INTO teacher_requests (user_id, partner_id, message) VALUES (?, ?, ?)
     ON CONFLICT (user_id) DO UPDATE SET partner_id = excluded.partner_id, message = excluded.message,
       status = 'pending', created_at = datetime('now'), decided_at = NULL`,
    user.id, partnerId, message,
  );
  revalidatePath("/enseignant");
  return {};
}

export async function decideTeacherRequest(requestId: number, approve: boolean) {
  await requireAdmin();
  const request = one<{ user_id: number }>("SELECT user_id FROM teacher_requests WHERE id = ?", requestId);
  if (!request) return;
  run("UPDATE teacher_requests SET status = ?, decided_at = datetime('now') WHERE id = ?", approve ? "approved" : "refused", requestId);
  run("UPDATE users SET role = ? WHERE id = ?", approve ? "teacher" : "student", request.user_id);
  revalidatePath("/admin/enseignants");
}

// ---------- Cours ----------

export async function saveCourse(courseId: number | null, _: FormState, formData: FormData): Promise<FormState> {
  const user = await requireTeacher();
  const title = text(formData, "title");
  const subtitle = text(formData, "subtitle");
  const description = text(formData, "description");
  const domainId = Number(formData.get("domain"));
  const partnerId = Number(formData.get("partner"));
  const level = text(formData, "level");
  const hours = Number(formData.get("hours"));
  const outcomes = lines(text(formData, "outcomes"));
  const skills = text(formData, "skills").split(",").map((s) => s.trim()).filter(Boolean);

  if (title.length < 4) return { error: "Le titre doit contenir au moins 4 caractères." };
  if (subtitle.length < 10) return { error: "Le sous-titre doit contenir au moins 10 caractères." };
  if (description.length < 40) return { error: "La description doit contenir au moins 40 caractères." };
  if (!one("SELECT 1 FROM domains WHERE id = ?", domainId)) return { error: "Choisissez un domaine." };
  if (!one("SELECT 1 FROM partners WHERE id = ?", partnerId)) return { error: "Choisissez un établissement." };
  if (!(LEVELS as readonly string[]).includes(level)) return { error: "Choisissez un niveau." };
  if (!(hours >= 1 && hours <= 500)) return { error: "La durée doit être comprise entre 1 et 500 heures." };
  if (outcomes.length === 0) return { error: "Indiquez au moins un objectif (un par ligne)." };
  if (skills.length === 0) return { error: "Indiquez au moins une compétence." };

  const instructorId = instructorIdFor(user, partnerId);
  if (courseId === null) {
    const hue = Math.floor(Math.random() * 360);
    const id = Number(
      run(
        `INSERT INTO courses (slug, title, subtitle, description, domain_id, partner_id, instructor_id, level, hours, hue, outcomes, skills, owner_id, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', datetime('now'))`,
        slugify(title), title, subtitle, description, domainId, partnerId, instructorId, level, hours, hue,
        JSON.stringify(outcomes), JSON.stringify(skills), user.id,
      ).lastInsertRowid,
    );
    run("INSERT INTO modules (course_id, position, title, summary) VALUES (?, 1, ?, ?)", id, "Introduction", "Présentation du cours et de ses objectifs.");
    refresh();
    redirect(`/enseignant/cours/${id}`);
  }

  assertCourse(user, courseId);
  run(
    `UPDATE courses SET title = ?, subtitle = ?, description = ?, domain_id = ?, partner_id = ?, instructor_id = ?,
       level = ?, hours = ?, outcomes = ?, skills = ? WHERE id = ?`,
    title, subtitle, description, domainId, partnerId, instructorId, level, hours, JSON.stringify(outcomes), JSON.stringify(skills), courseId,
  );
  refresh();
  return {};
}

export async function setCourseStatus(courseId: number, status: "draft" | "published") {
  const user = await requireTeacher();
  assertCourse(user, courseId);
  if (status === "published") {
    const items = one<{ n: number }>("SELECT COUNT(*) AS n FROM items i JOIN modules m ON m.id = i.module_id WHERE m.course_id = ?", courseId)!;
    if (items.n === 0) redirect(`/enseignant/cours/${courseId}?erreur=vide`);
  }
  run("UPDATE courses SET status = ? WHERE id = ?", status, courseId);
  refresh();
}

export async function deleteCourse(courseId: number) {
  const user = await requireTeacher();
  const course = assertCourse(user, courseId);
  if (course.learners > 0) redirect(`/enseignant/cours/${courseId}?erreur=inscrits`);
  run("DELETE FROM saved WHERE course_id = ?", courseId);
  run("DELETE FROM submissions WHERE item_id IN (SELECT i.id FROM items i JOIN modules m ON m.id = i.module_id WHERE m.course_id = ?)", courseId);
  run("DELETE FROM reviews WHERE course_id = ?", courseId);
  run("DELETE FROM items WHERE module_id IN (SELECT id FROM modules WHERE course_id = ?)", courseId);
  run("DELETE FROM modules WHERE course_id = ?", courseId);
  run("DELETE FROM courses WHERE id = ?", courseId);
  refresh();
  redirect("/enseignant");
}

// ---------- Modules ----------

export async function addModule(courseId: number, formData: FormData) {
  const user = await requireTeacher();
  assertCourse(user, courseId);
  const title = text(formData, "title") || "Nouveau module";
  run("INSERT INTO modules (course_id, position, title, summary) VALUES (?, ?, ?, ?)", courseId, nextPosition("modules", "course_id", courseId), title, "");
  refresh();
}

export async function updateModule(moduleId: number, formData: FormData) {
  const user = await requireTeacher();
  assertCourse(user, courseIdOfModule(moduleId));
  const title = text(formData, "title");
  if (title) run("UPDATE modules SET title = ?, summary = ? WHERE id = ?", title, text(formData, "summary"), moduleId);
  refresh();
}

export async function moveModule(moduleId: number, direction: -1 | 1) {
  const user = await requireTeacher();
  assertCourse(user, courseIdOfModule(moduleId));
  swapPosition("modules", "course_id", moduleId, direction);
  refresh();
}

export async function deleteModule(moduleId: number) {
  const user = await requireTeacher();
  assertCourse(user, courseIdOfModule(moduleId));
  run("DELETE FROM progress WHERE item_id IN (SELECT id FROM items WHERE module_id = ?)", moduleId);
  run("DELETE FROM submissions WHERE item_id IN (SELECT id FROM items WHERE module_id = ?)", moduleId);
  run("DELETE FROM items WHERE module_id = ?", moduleId);
  run("DELETE FROM modules WHERE id = ?", moduleId);
  refresh();
}

// ---------- Éléments ----------

const NEW_ITEM = {
  video: { title: "Nouvelle vidéo", minutes: 8, content: "" },
  reading: { title: "Nouvelle lecture", minutes: 10, content: "" },
  quiz: { title: "Nouveau quiz", minutes: 5, content: "[]" },
  cards: { title: "Glossaire", minutes: 6, content: "[]" },
  match: { title: "Associer", minutes: 8, content: JSON.stringify({ instruction: "", pairs: [] }) },
  reflection: { title: "Questions de réflexion", minutes: 8, content: "[]" },
  tp: { title: "Travail pratique", minutes: 60, content: "" },
} as const;

export async function addItem(moduleId: number, kind: keyof typeof NEW_ITEM) {
  const user = await requireTeacher();
  const courseId = courseIdOfModule(moduleId);
  assertCourse(user, courseId);
  const d = NEW_ITEM[kind];
  const id = run(
    "INSERT INTO items (module_id, position, kind, title, minutes, content) VALUES (?, ?, ?, ?, ?, ?)",
    moduleId, nextPosition("items", "module_id", moduleId), kind, d.title, d.minutes, d.content,
  ).lastInsertRowid;
  refresh();
  redirect(`/enseignant/cours/${courseId}/elements/${id}`);
}

export async function saveItem(itemId: number, _: FormState, formData: FormData): Promise<FormState> {
  const user = await requireTeacher();
  assertCourse(user, courseIdOfItem(itemId));
  const item = one<{ kind: string }>("SELECT kind FROM items WHERE id = ?", itemId)!;
  const title = text(formData, "title");
  const minutes = Number(formData.get("minutes"));
  if (title.length < 3) return { error: "Le titre doit contenir au moins 3 caractères." };
  if (!(minutes >= 1 && minutes <= 240)) return { error: "La durée doit être comprise entre 1 et 240 minutes." };

  let content = text(formData, "content");
  let videoUrl: string | null = null;

  if (item.kind === "video") {
    videoUrl = text(formData, "video_url") || null;
    if (videoUrl && !videoEmbed(videoUrl)) return { error: "Lien vidéo non reconnu : utilisez un lien YouTube ou un fichier .mp4/.webm en https." };
    if (!videoUrl && content.length < 20) return { error: "Ajoutez un lien vidéo ou une transcription d'au moins 20 caractères." };
  } else if (item.kind === "reading") {
    if (content.length < 40) return { error: "La lecture doit contenir au moins 40 caractères." };
  } else if (item.kind === "tp") {
    if (content.length < 40) return { error: "La consigne doit contenir au moins 40 caractères." };
  } else if (item.kind === "cards" || item.kind === "match" || item.kind === "reflection") {
    // Une ligne par entrée : « gauche :: droite » (la partie droite est facultative pour la réflexion).
    const pairs = lines(content).map((l) => l.split("::").map((p) => p.trim()));
    if (pairs.length === 0) return { error: "Ajoutez au moins une ligne." };
    if (item.kind !== "reflection" && pairs.some((p) => p.length < 2 || !p[0] || !p[1])) return { error: "Chaque ligne doit avoir la forme « élément :: correspondance »." };
    if (item.kind === "match" && pairs.length < 2) return { error: "Une association demande au moins deux lignes." };
    if (item.kind === "cards") content = JSON.stringify(pairs.map(([term, definition]) => ({ term, definition })));
    else if (item.kind === "match") content = JSON.stringify({ instruction: text(formData, "instruction") || "Associez chaque élément à sa correspondance.", pairs: pairs.map(([left, right]) => ({ left, right })) });
    else content = JSON.stringify(pairs.map(([question, hint]) => ({ question, hint: hint ?? "" })));
  } else {
    let questions: QuizQuestion[];
    try {
      questions = JSON.parse(content);
    } catch {
      return { error: "Le quiz n'a pas pu être lu. Rechargez la page et réessayez." };
    }
    if (!Array.isArray(questions) || questions.length === 0) return { error: "Ajoutez au moins une question." };
    for (const [i, q] of questions.entries()) {
      const options = Array.isArray(q.options) ? q.options.map((o) => String(o).trim()) : [];
      if (!String(q.question ?? "").trim()) return { error: `La question ${i + 1} est vide.` };
      if (options.length < 2 || options.some((o) => !o)) return { error: `La question ${i + 1} doit avoir au moins deux réponses, sans réponse vide.` };
      if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < options.length)) return { error: `Indiquez la bonne réponse de la question ${i + 1}.` };
    }
    content = JSON.stringify(questions.map((q) => ({ question: String(q.question).trim(), options: q.options.map((o) => String(o).trim()), answer: q.answer })));
  }

  run("UPDATE items SET title = ?, minutes = ?, content = ?, video_url = ? WHERE id = ?", title, minutes, content, videoUrl, itemId);
  refresh();
  return {};
}

export async function moveItem(itemId: number, direction: -1 | 1) {
  const user = await requireTeacher();
  assertCourse(user, courseIdOfItem(itemId));
  swapPosition("items", "module_id", itemId, direction);
  refresh();
}

export async function deleteItem(itemId: number) {
  const user = await requireTeacher();
  const courseId = courseIdOfItem(itemId);
  assertCourse(user, courseId);
  run("DELETE FROM progress WHERE item_id = ?", itemId);
  run("DELETE FROM submissions WHERE item_id = ?", itemId);
  run("DELETE FROM items WHERE id = ?", itemId);
  refresh();
  redirect(`/enseignant/cours/${courseId}`);
}

// ---------- Travaux pratiques ----------

export async function gradeTp(courseId: number, submissionId: number, _: FormState, formData: FormData): Promise<FormState> {
  const user = await requireTeacher();
  assertCourse(user, courseId);
  const submission = one("SELECT 1 FROM submissions s JOIN items i ON i.id = s.item_id JOIN modules m ON m.id = i.module_id WHERE s.id = ? AND m.course_id = ?", submissionId, courseId);
  if (!submission) return { error: "Rendu introuvable." };
  const raw = text(formData, "grade").replace(",", ".");
  const grade = Number(raw);
  if (raw === "" || !(grade >= 0 && grade <= 20)) return { error: "Note entre 0 et 20." };
  gradeSubmission(submissionId, Math.round(grade * 100) / 100, text(formData, "feedback"));
  revalidatePath(`/enseignant/cours/${courseId}/tp`);
  return {};
}

// ---------- Examens ----------

export async function setExamOpen(courseId: number, open: boolean) {
  const user = await requireTeacher();
  assertCourse(user, courseId);
  run("UPDATE exams SET is_open = ? WHERE course_id = ?", open ? 1 : 0, courseId);
  revalidatePath("/", "layout");
}

export async function resetExamAttempt(courseId: number, attemptId: number) {
  const user = await requireTeacher();
  assertCourse(user, courseId);
  const attempt = one<{ exam_id: number }>("SELECT a.exam_id FROM exam_attempts a JOIN exams e ON e.id = a.exam_id WHERE a.id = ? AND e.course_id = ?", attemptId, courseId);
  if (attempt) run("DELETE FROM exam_attempts WHERE id = ?", attemptId);
  revalidatePath(`/enseignant/cours/${courseId}/examen`);
  revalidatePath("/admin");
}
