import "server-only";
import { all, one } from "./db";
import type { AttemptStatus } from "./exams";

// Vues d'ensemble pour la page d'administration.

export type AdminCourse = {
  id: number; slug: string; title: string; status: "draft" | "published"; level: string; partner_short: string; partner_name: string;
  owner_name: string | null; learners: number; items: number; exam_id: number | null; exam_open: number | null; attempts: number;
};

export function listAdminCourses() {
  return all<AdminCourse>(
    `SELECT c.id, c.slug, c.title, c.status, c.level, p.short AS partner_short, p.name AS partner_name, u.name AS owner_name,
       (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS learners,
       (SELECT COUNT(*) FROM items i JOIN modules m ON m.id = i.module_id WHERE m.course_id = c.id) AS items,
       x.id AS exam_id, x.is_open AS exam_open,
       (SELECT COUNT(*) FROM exam_attempts a WHERE a.exam_id = x.id) AS attempts
     FROM courses c
     JOIN partners p ON p.id = c.partner_id
     LEFT JOIN users u ON u.id = c.owner_id
     LEFT JOIN exams x ON x.course_id = c.id
     ORDER BY x.id IS NULL, c.status = 'draft' DESC, c.title`,
  );
}

export type AdminAttempt = {
  id: number; course_id: number; course_title: string; user_name: string; user_email: string; university: string | null; program: string | null; study_level: string | null; status: AttemptStatus;
  score: number | null; switches: number; max_switches: number; started_at: string;
};

export function listAdminAttempts(q: string) {
  const like = `%${q.toLowerCase()}%`;
  return all<AdminAttempt>(
    `SELECT a.id, x.course_id, c.title AS course_title, u.name AS user_name, u.email AS user_email, u.university, u.program, u.study_level, a.status, a.score, a.switches,
       x.max_switches, a.started_at
     FROM exam_attempts a
     JOIN exams x ON x.id = a.exam_id
     JOIN courses c ON c.id = x.course_id
     JOIN users u ON u.id = a.user_id
     WHERE ? = '' OR lower(u.name) LIKE ? OR lower(u.email) LIKE ? OR lower(c.title) LIKE ?
     ORDER BY a.started_at DESC LIMIT 200`,
    q, like, like, like,
  );
}

export function adminStats() {
  return one<{ published: number; drafts: number; open_exams: number; pending_requests: number; learners: number }>(
    `SELECT (SELECT COUNT(*) FROM courses WHERE status = 'published') AS published,
            (SELECT COUNT(*) FROM courses WHERE status = 'draft') AS drafts,
            (SELECT COUNT(*) FROM exams WHERE is_open = 1) AS open_exams,
            (SELECT COUNT(*) FROM teacher_requests WHERE status = 'pending') AS pending_requests,
            (SELECT COUNT(DISTINCT user_id) FROM enrollments) AS learners`,
  )!;
}
