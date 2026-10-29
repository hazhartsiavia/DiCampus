import "server-only";
import { all } from "./db";
import type { AttemptStatus } from "./exams";

// Étudiants inscrits : liste générale (administration) et liste par cours (enseignant).

export type Student = {
  id: number; name: string; first_name: string | null; last_name: string | null; email: string;
  university: string | null; program: string | null; study_level: string | null; created_at: string;
  courses: string | null; course_count: number;
};

export type StudentFilters = { q: string; university: string; program: string; level: string };

export function readFilters(params: Record<string, string | undefined>): StudentFilters {
  const v = (key: string) => (params[key] ?? "").trim();
  return { q: v("q"), university: v("universite"), program: v("parcours"), level: v("niveau") };
}

export function listStudents(f: StudentFilters) {
  const like = `%${f.q.toLowerCase()}%`;
  return all<Student>(
    `SELECT u.id, u.name, u.first_name, u.last_name, u.email, u.university, u.program, u.study_level, u.created_at,
       (SELECT group_concat(c.title, ' · ') FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = u.id) AS courses,
       (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) AS course_count
     FROM users u
     WHERE (? = '' OR lower(u.name) LIKE ? OR lower(u.email) LIKE ? OR lower(coalesce(u.program, '')) LIKE ?)
       AND (? = '' OR u.university = ?)
       AND (? = '' OR u.program = ?)
       AND (? = '' OR u.study_level = ?)
     ORDER BY u.created_at DESC`,
    f.q, like, like, like, f.university, f.university, f.program, f.program, f.level, f.level,
  );
}

/** Valeurs distinctes déjà saisies, pour les filtres. */
export function studentFilterOptions() {
  const distinct = (column: "university" | "program" | "study_level") =>
    all<{ v: string }>(`SELECT DISTINCT ${column} AS v FROM users WHERE ${column} IS NOT NULL AND ${column} != '' ORDER BY v`).map((r) => r.v);
  return { universities: distinct("university"), programs: distinct("program"), levels: distinct("study_level") };
}

export type CourseStudent = {
  id: number; name: string; email: string; university: string | null; program: string | null; study_level: string | null;
  enrolled_at: string; completed_at: string | null; done: number; total: number;
  tp_done: number; tp_total: number; tp_avg: number | null;
  exam_status: AttemptStatus | null; exam_score: number | null;
};

export function listCourseStudents(courseId: number) {
  return all<CourseStudent>(
    `WITH course_items AS (
       SELECT i.id, i.kind FROM items i JOIN modules m ON m.id = i.module_id WHERE m.course_id = ?
     )
     SELECT u.id, u.name, u.email, u.university, u.program, u.study_level, e.enrolled_at, e.completed_at,
       (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.item_id IN (SELECT id FROM course_items)) AS done,
       (SELECT COUNT(*) FROM course_items) AS total,
       (SELECT COUNT(*) FROM submissions s WHERE s.user_id = u.id AND s.item_id IN (SELECT id FROM course_items WHERE kind = 'tp')) AS tp_done,
       (SELECT COUNT(*) FROM course_items WHERE kind = 'tp') AS tp_total,
       (SELECT ROUND(AVG(s.grade), 2) FROM submissions s WHERE s.user_id = u.id AND s.grade IS NOT NULL AND s.item_id IN (SELECT id FROM course_items)) AS tp_avg,
       a.status AS exam_status, a.score AS exam_score
     FROM enrollments e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN exams x ON x.course_id = e.course_id
     LEFT JOIN exam_attempts a ON a.exam_id = x.id AND a.user_id = u.id
     WHERE e.course_id = ?
     ORDER BY u.name`,
    courseId, courseId,
  );
}

/** Pourcentage d'avancement arrondi. */
export function percent(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}
