import "server-only";
import { randomBytes } from "node:crypto";
import { all, one, run, type QuizQuestion } from "./db";

export type CourseCard = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  level: string;
  hours: number;
  hue: number;
  partner_name: string;
  domain_name: string;
  domain_slug: string;
  rating: number | null;
  review_count: number;
  learners: number;
  module_count: number;
  partner_short: string;
};

const CARD_SELECT = `
  SELECT c.id, c.slug, c.title, c.subtitle, c.level, c.hours, c.hue,
         p.name AS partner_name, d.name AS domain_name, d.slug AS domain_slug,
         (SELECT ROUND(AVG(rating), 1) FROM reviews r WHERE r.course_id = c.id) AS rating,
         (SELECT COUNT(*) FROM reviews r WHERE r.course_id = c.id) AS review_count,
         (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS learners,
         (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS module_count,
         p.short AS partner_short
  FROM courses c
  JOIN partners p ON p.id = c.partner_id
  JOIN domains d ON d.id = c.domain_id`;

export type Domain = { id: number; slug: string; name: string; description: string; icon: string; course_count: number };

export function listDomains() {
  return all<Domain>(
    `SELECT d.*, (SELECT COUNT(*) FROM courses c WHERE c.domain_id = d.id AND c.status = 'published') AS course_count
     FROM domains d ORDER BY d.id`,
  );
}

export function getDomain(slug: string) {
  return listDomains().find((d) => d.slug === slug);
}

export function listPartners() {
  return all<{ slug: string; name: string }>("SELECT slug, name FROM partners ORDER BY name");
}

export type CourseFilters = { q?: string; domain?: string; level?: string; partner?: string; sort?: string };

export function searchCourses({ q, domain, level, partner, sort }: CourseFilters) {
  const where: string[] = ["c.status = 'published'"];
  const params: string[] = [];
  if (q?.trim()) {
    const like = `%${q.trim().toLowerCase()}%`;
    where.push("(LOWER(c.title) LIKE ? OR LOWER(c.subtitle) LIKE ? OR LOWER(c.skills) LIKE ? OR LOWER(c.description) LIKE ?)");
    params.push(like, like, like, like);
  }
  if (domain) { where.push("d.slug = ?"); params.push(domain); }
  if (level) { where.push("c.level = ?"); params.push(level); }
  if (partner) { where.push("p.slug = ?"); params.push(partner); }
  const order =
    sort === "duree" ? "c.hours ASC" :
    sort === "note" ? "rating IS NULL, rating DESC" :
    sort === "recent" ? "c.id DESC" :
    "learners DESC, c.id ASC";
  return all<CourseCard>(`${CARD_SELECT} WHERE ${where.join(" AND ")} ORDER BY ${order}`, ...params);
}

export function popularCourses(limit = 8) {
  return all<CourseCard>(`${CARD_SELECT} WHERE c.status = 'published' ORDER BY learners DESC, c.id ASC LIMIT ?`, limit);
}

export function coursesByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return all<CourseCard>(`${CARD_SELECT} WHERE c.id IN (${ids.map(() => "?").join(",")})`, ...ids);
}

export type CourseDetail = CourseCard & {
  description: string;
  outcomes: string[];
  skills: string[];
  partner_slug: string;
  partner_description: string;
  instructor_name: string;
  instructor_title: string;
  status: "draft" | "published";
  owner_id: number | null;
};

export function getCourse(slug: string): CourseDetail | undefined {
  const row = one<CourseCard & { status: "draft" | "published"; owner_id: number | null; description: string; outcomes: string; skills: string; partner_slug: string; partner_description: string; instructor_name: string; instructor_title: string }>(
    `SELECT card.*, c.description, c.outcomes, c.skills, c.status, c.owner_id, p.slug AS partner_slug, p.description AS partner_description,
            i.name AS instructor_name, i.title AS instructor_title
     FROM (${CARD_SELECT}) card
     JOIN courses c ON c.id = card.id
     JOIN partners p ON p.id = c.partner_id
     JOIN instructors i ON i.id = c.instructor_id
     WHERE card.slug = ?`,
    slug,
  );
  if (!row) return undefined;
  return { ...row, outcomes: JSON.parse(row.outcomes), skills: JSON.parse(row.skills) };
}

export type ItemKind = "video" | "reading" | "quiz" | "cards" | "match" | "reflection" | "tp";
export type Item = { id: number; module_id: number; position: number; kind: ItemKind; title: string; minutes: number; content: string; video_url: string | null };
export type Module = { id: number; position: number; title: string; summary: string; items: Item[] };

export function getModules(courseId: number): Module[] {
  const modules = all<Omit<Module, "items">>("SELECT id, position, title, summary FROM modules WHERE course_id = ? ORDER BY position", courseId);
  const items = all<Item>(
    `SELECT i.* FROM items i JOIN modules m ON m.id = i.module_id WHERE m.course_id = ? ORDER BY m.position, i.position`,
    courseId,
  );
  return modules.map((m) => ({ ...m, items: items.filter((i) => i.module_id === m.id) }));
}

export function parseQuiz(item: Item): QuizQuestion[] {
  return JSON.parse(item.content);
}

export type Specialization = { id: number; slug: string; title: string; description: string; partner_name: string; domain_name: string; course_count: number; hours: number };

const SPEC_SELECT = `
  SELECT s.id, s.slug, s.title, s.description, p.name AS partner_name, d.name AS domain_name,
         COUNT(sc.course_id) AS course_count, SUM(c.hours) AS hours
  FROM specializations s
  JOIN partners p ON p.id = s.partner_id
  JOIN domains d ON d.id = s.domain_id
  JOIN specialization_courses sc ON sc.specialization_id = s.id
  JOIN courses c ON c.id = sc.course_id`;

export function listSpecializations() {
  return all<Specialization>(`${SPEC_SELECT} GROUP BY s.id ORDER BY s.id`);
}

export function getSpecialization(slug: string) {
  const spec = one<Specialization>(`${SPEC_SELECT} WHERE s.slug = ? GROUP BY s.id`, slug);
  if (!spec) return undefined;
  const ids = all<{ course_id: number }>("SELECT course_id FROM specialization_courses WHERE specialization_id = ? ORDER BY position", spec.id).map((r) => r.course_id);
  const cards = coursesByIds(ids);
  return { ...spec, courses: ids.map((id) => cards.find((c) => c.id === id)!) };
}

export function specializationsForCourse(courseId: number) {
  return all<Specialization>(
    `${SPEC_SELECT} WHERE s.id IN (SELECT specialization_id FROM specialization_courses WHERE course_id = ?) GROUP BY s.id`,
    courseId,
  );
}

export type Review = { id: number; rating: number; comment: string; created_at: string; author: string; user_id: number };

export function getReviews(courseId: number) {
  return all<Review>(
    `SELECT r.id, r.rating, r.comment, r.created_at, r.user_id, u.name AS author
     FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.course_id = ? ORDER BY r.created_at DESC`,
    courseId,
  );
}

// ---------- Données de l'apprenant ----------

export type Enrollment = { enrolled_at: string; completed_at: string | null; certificate_code: string | null };

export function getEnrollment(userId: number, courseId: number) {
  return one<Enrollment>("SELECT enrolled_at, completed_at, certificate_code FROM enrollments WHERE user_id = ? AND course_id = ?", userId, courseId);
}

export function completedItemIds(userId: number, courseId: number) {
  return new Set(
    all<{ item_id: number }>(
      `SELECT p.item_id FROM progress p JOIN items i ON i.id = p.item_id JOIN modules m ON m.id = i.module_id
       WHERE p.user_id = ? AND m.course_id = ?`,
      userId,
      courseId,
    ).map((r) => r.item_id),
  );
}

export type MyCourse = CourseCard & { done: number; total: number; completed_at: string | null; next_item_id: number | null };

export function myCourses(userId: number): MyCourse[] {
  const rows = all<{ course_id: number; completed_at: string | null }>(
    "SELECT course_id, completed_at FROM enrollments WHERE user_id = ? ORDER BY enrolled_at DESC",
    userId,
  );
  const cards = coursesByIds(rows.map((r) => r.course_id));
  return rows.map((r) => {
    const counts = one<{ total: number; done: number }>(
      `SELECT COUNT(*) AS total, COUNT(p.item_id) AS done
       FROM items i JOIN modules m ON m.id = i.module_id
       LEFT JOIN progress p ON p.item_id = i.id AND p.user_id = ?
       WHERE m.course_id = ?`,
      userId,
      r.course_id,
    )!;
    const next = one<{ id: number }>(
      `SELECT i.id FROM items i JOIN modules m ON m.id = i.module_id
       LEFT JOIN progress p ON p.item_id = i.id AND p.user_id = ?
       WHERE m.course_id = ? AND p.item_id IS NULL ORDER BY m.position, i.position LIMIT 1`,
      userId,
      r.course_id,
    );
    return { ...cards.find((c) => c.id === r.course_id)!, ...counts, completed_at: r.completed_at, next_item_id: next?.id ?? null };
  });
}

export function firstItemId(courseId: number) {
  return one<{ id: number }>(
    "SELECT i.id FROM items i JOIN modules m ON m.id = i.module_id WHERE m.course_id = ? ORDER BY m.position, i.position LIMIT 1",
    courseId,
  )?.id;
}

export function isSaved(userId: number, courseId: number) {
  return !!one("SELECT 1 FROM saved WHERE user_id = ? AND course_id = ?", userId, courseId);
}

export function savedCourses(userId: number) {
  const ids = all<{ course_id: number }>("SELECT course_id FROM saved WHERE user_id = ? ORDER BY saved_at DESC", userId).map((r) => r.course_id);
  const cards = coursesByIds(ids);
  return ids.map((id) => cards.find((c) => c.id === id)!);
}

/** Jours distincts (lundi → dimanche de la semaine en cours) où l'apprenant a terminé au moins un élément. */
export function activeDaysThisWeek(userId: number) {
  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - ((now.getUTCDay() + 6) % 7)));
  const rows = all<{ day: string }>(
    "SELECT DISTINCT date(completed_at) AS day FROM progress WHERE user_id = ? AND completed_at >= ?",
    userId,
    monday.toISOString().slice(0, 10),
  );
  return rows.map((r) => r.day);
}

export function markItemComplete(userId: number, itemId: number) {
  run("INSERT OR IGNORE INTO progress (user_id, item_id, completed_at) VALUES (?, ?, datetime('now'))", userId, itemId);
  const course = one<{ course_id: number }>("SELECT m.course_id FROM items i JOIN modules m ON m.id = i.module_id WHERE i.id = ?", itemId);
  if (!course) return;
  const left = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM items i JOIN modules m ON m.id = i.module_id
     LEFT JOIN progress p ON p.item_id = i.id AND p.user_id = ?
     WHERE m.course_id = ? AND p.item_id IS NULL`,
    userId,
    course.course_id,
  )!;
  if (left.n === 0) {
    const code = randomBytes(6).toString("hex").toUpperCase();
    run(
      "UPDATE enrollments SET completed_at = datetime('now'), certificate_code = ? WHERE user_id = ? AND course_id = ? AND completed_at IS NULL",
      code,
      userId,
      course.course_id,
    );
  }
}

export type Certificate = { code: string; completed_at: string; learner: string; course_title: string; course_slug: string; partner_name: string; instructor_name: string; hours: number; hue: number };

const CERT_SELECT = `
  SELECT e.certificate_code AS code, e.completed_at, u.name AS learner, c.title AS course_title, c.slug AS course_slug,
         p.name AS partner_name, i.name AS instructor_name, c.hours, c.hue
  FROM enrollments e
  JOIN users u ON u.id = e.user_id
  JOIN courses c ON c.id = e.course_id
  JOIN partners p ON p.id = c.partner_id
  JOIN instructors i ON i.id = c.instructor_id`;

export function myCertificates(userId: number) {
  return all<Certificate>(`${CERT_SELECT} WHERE e.user_id = ? AND e.certificate_code IS NOT NULL ORDER BY e.completed_at DESC`, userId);
}

export function getCertificate(code: string) {
  return one<Certificate>(`${CERT_SELECT} WHERE e.certificate_code = ?`, code);
}

// ---------- Accueil ----------

export function catalogStats() {
  return one<{ courses: number; modules: number; specializations: number; hours: number }>(
    `SELECT (SELECT COUNT(*) FROM courses WHERE status = 'published') AS courses,
            (SELECT COUNT(*) FROM modules m JOIN courses c ON c.id = m.course_id WHERE c.status = 'published') AS modules,
            (SELECT COUNT(*) FROM specializations) AS specializations,
            (SELECT SUM(hours) FROM courses WHERE status = 'published') AS hours`,
  )!;
}

export type Establishment = { slug: string; short: string; name: string; kind: string; courses: number; hue: number };

export function listEstablishments() {
  return all<Establishment>(
    `SELECT p.slug, p.short, p.name, p.kind, COUNT(c.id) AS courses, MIN(c.hue) AS hue
     FROM partners p JOIN courses c ON c.partner_id = p.id
     WHERE p.kind != ? AND c.status = 'published'
     GROUP BY p.id ORDER BY p.id`,
    "Plateforme",
  );
}
