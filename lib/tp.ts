import "server-only";
import { all, one, run } from "./db";

// Travaux pratiques : l'élève rend un texte (et un lien facultatif), l'enseignant le note sur 20.

export type Submission = {
  id: number; item_id: number; user_id: number; text: string; link: string | null; submitted_at: string;
  grade: number | null; feedback: string | null; graded_at: string | null;
};

export type SubmissionRow = Submission & { user_name: string; user_email: string; university: string | null; program: string | null; study_level: string | null };

export type TpSummary = { id: number; title: string; module_title: string; total: number; to_grade: number };

export const TP_TEXT_MIN = 20;
export const TP_TEXT_MAX = 20_000;

/** Liens acceptés : http(s) uniquement, pour ne jamais afficher un lien javascript:. */
export function safeLink(value: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function getSubmission(itemId: number, userId: number) {
  return one<Submission>("SELECT * FROM submissions WHERE item_id = ? AND user_id = ?", itemId, userId);
}

export function saveSubmission(itemId: number, userId: number, text: string, link: string | null) {
  run(
    `INSERT INTO submissions (item_id, user_id, text, link) VALUES (?, ?, ?, ?)
     ON CONFLICT (item_id, user_id) DO UPDATE SET text = excluded.text, link = excluded.link, submitted_at = datetime('now')`,
    itemId, userId, text, link,
  );
}

export function listTpItems(courseId: number) {
  return all<TpSummary>(
    `SELECT i.id, i.title, m.title AS module_title,
       (SELECT COUNT(*) FROM submissions s WHERE s.item_id = i.id) AS total,
       (SELECT COUNT(*) FROM submissions s WHERE s.item_id = i.id AND s.grade IS NULL) AS to_grade
     FROM items i JOIN modules m ON m.id = i.module_id
     WHERE m.course_id = ? AND i.kind = 'tp' ORDER BY m.position, i.position`,
    courseId,
  );
}

export function listSubmissions(itemId: number) {
  return all<SubmissionRow>(
    `SELECT s.*, u.name AS user_name, u.email AS user_email, u.university, u.program, u.study_level
     FROM submissions s JOIN users u ON u.id = s.user_id
     WHERE s.item_id = ? ORDER BY s.grade IS NOT NULL, s.submitted_at`,
    itemId,
  );
}

export function gradeSubmission(submissionId: number, grade: number, feedback: string) {
  run("UPDATE submissions SET grade = ?, feedback = ?, graded_at = datetime('now') WHERE id = ?", grade, feedback, submissionId);
}
