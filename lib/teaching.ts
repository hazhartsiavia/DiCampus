import "server-only";
import { all, one, run } from "./db";
import type { User } from "./auth";

// ---------- Demandes d'accès enseignant ----------

export type TeacherRequest = {
  id: number; user_id: number; partner_id: number; message: string; status: "pending" | "approved" | "refused";
  created_at: string; decided_at: string | null; partner_name: string; user_name: string; user_email: string;
};

const REQUEST_SELECT = `
  SELECT r.*, p.name AS partner_name, u.name AS user_name, u.email AS user_email
  FROM teacher_requests r JOIN partners p ON p.id = r.partner_id JOIN users u ON u.id = r.user_id`;

export function getTeacherRequest(userId: number) {
  return one<TeacherRequest>(`${REQUEST_SELECT} WHERE r.user_id = ?`, userId);
}

export function listTeacherRequests() {
  return all<TeacherRequest>(`${REQUEST_SELECT} ORDER BY r.status = 'pending' DESC, r.created_at DESC`);
}

export function listEstablishmentOptions() {
  return all<{ id: number; slug: string; name: string }>("SELECT id, slug, name FROM partners ORDER BY kind = 'Plateforme', name");
}

export function listDomainOptions() {
  return all<{ id: number; name: string }>("SELECT id, name FROM domains ORDER BY id");
}

// ---------- Cours de l'enseignant ----------

export type TeachingCourse = {
  id: number; owner_id: number | null; slug: string; title: string; subtitle: string; status: "draft" | "published"; hue: number; level: string;
  partner_name: string; modules: number; items: number; learners: number;
};

/** Les cours de l’enseignant ; un administrateur voit tous les cours. */
export function myTeachingCourses(userId: number, isAdmin = false) {
  return all<TeachingCourse & { has_exam: number }>(
    `SELECT c.id, c.owner_id, c.slug, c.title, c.subtitle, c.status, c.hue, c.level, p.name AS partner_name,
            (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS modules,
            (SELECT COUNT(*) FROM items i JOIN modules m ON m.id = i.module_id WHERE m.course_id = c.id) AS items,
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS learners,
            EXISTS (SELECT 1 FROM exams x WHERE x.course_id = c.id) AS has_exam
     FROM courses c JOIN partners p ON p.id = c.partner_id
     WHERE c.owner_id = ? OR ? = 1 ORDER BY c.owner_id = ? DESC, has_exam DESC, c.id DESC`,
    userId,
    isAdmin ? 1 : 0,
    userId,
  );
}

export type EditableCourse = {
  id: number; slug: string; title: string; subtitle: string; description: string; domain_id: number; partner_id: number;
  level: string; hours: number; hue: number; outcomes: string[]; skills: string[]; status: "draft" | "published"; owner_id: number | null;
  learners: number;
};

/** Le cours, si `user` peut le modifier (propriétaire ou administrateur). */
export function getEditableCourse(courseId: number, user: User): EditableCourse | undefined {
  const row = one<Omit<EditableCourse, "outcomes" | "skills"> & { outcomes: string; skills: string }>(
    `SELECT c.id, c.slug, c.title, c.subtitle, c.description, c.domain_id, c.partner_id, c.level, c.hours, c.hue,
            c.outcomes, c.skills, c.status, c.owner_id,
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS learners
     FROM courses c WHERE c.id = ?`,
    courseId,
  );
  if (!row || !(row.owner_id === user.id || user.isAdmin)) return undefined;
  return { ...row, outcomes: JSON.parse(row.outcomes), skills: JSON.parse(row.skills) };
}

export function courseIdOfModule(moduleId: number) {
  return one<{ course_id: number }>("SELECT course_id FROM modules WHERE id = ?", moduleId)?.course_id;
}

export function courseIdOfItem(itemId: number) {
  return one<{ course_id: number }>("SELECT m.course_id FROM items i JOIN modules m ON m.id = i.module_id WHERE i.id = ?", itemId)?.course_id;
}

export function slugify(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "cours";
  let slug = base;
  for (let n = 2; one("SELECT 1 FROM courses WHERE slug = ?", slug); n++) slug = `${base}-${n}`;
  return slug;
}

/** Fiche formateur liée au compte de l'enseignant, créée au besoin pour cet établissement. */
export function instructorIdFor(user: User, partnerId: number) {
  const existing = one<{ id: number }>("SELECT id FROM instructors WHERE user_id = ? AND partner_id = ?", user.id, partnerId);
  if (existing) return existing.id;
  const partner = one<{ name: string }>("SELECT name FROM partners WHERE id = ?", partnerId)!;
  return Number(run("INSERT INTO instructors (name, title, partner_id, user_id) VALUES (?, ?, ?, ?)", user.name, `Enseignant · ${partner.name}`, partnerId, user.id).lastInsertRowid);
}

/** Échange la position d'un module (ou élément) avec son voisin dans la direction donnée. */
export function swapPosition(table: "modules" | "items", parentColumn: "course_id" | "module_id", id: number, direction: -1 | 1) {
  const current = one<{ position: number; parent: number }>(`SELECT position, ${parentColumn} AS parent FROM ${table} WHERE id = ?`, id);
  if (!current) return;
  const neighbor = one<{ id: number; position: number }>(
    direction < 0
      ? `SELECT id, position FROM ${table} WHERE ${parentColumn} = ? AND position < ? ORDER BY position DESC LIMIT 1`
      : `SELECT id, position FROM ${table} WHERE ${parentColumn} = ? AND position > ? ORDER BY position ASC LIMIT 1`,
    current.parent,
    current.position,
  );
  if (!neighbor) return;
  run(`UPDATE ${table} SET position = ? WHERE id = ?`, neighbor.position, id);
  run(`UPDATE ${table} SET position = ? WHERE id = ?`, current.position, neighbor.id);
}

export function nextPosition(table: "modules" | "items", parentColumn: "course_id" | "module_id", parentId: number) {
  return (one<{ p: number | null }>(`SELECT MAX(position) AS p FROM ${table} WHERE ${parentColumn} = ?`, parentId)?.p ?? 0) + 1;
}

/** Une vidéo intégrable : lien YouTube converti en lecteur sans cookies, ou fichier MP4/WebM en https. */
export function videoEmbed(url: string | null): { type: "youtube" | "file"; src: string } | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const host = parsed.hostname.replace(/^www\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = parsed.pathname.slice(1);
  else if (host === "youtube.com" || host === "m.youtube.com") id = parsed.searchParams.get("v") ?? parsed.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1] ?? null;
  if (id && /^[\w-]{6,20}$/.test(id)) return { type: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}` };
  if (/\.(mp4|webm)$/i.test(parsed.pathname)) return { type: "file", src: parsed.toString() };
  return null;
}
