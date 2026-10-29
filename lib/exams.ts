import "server-only";
import { randomInt } from "node:crypto";
import { all, one, run, type QuizQuestion } from "./db";

export type Exam = {
  id: number; course_id: number; title: string; duration_minutes: number; penalty_minutes: number; max_switches: number; questions: QuizQuestion[];
  /** 1 : les élèves peuvent commencer l'examen ; 0 : fermé (une copie déjà commencée peut être terminée). */
  is_open: number;
};

export type AttemptStatus = "in_progress" | "submitted" | "expired" | "terminated";

export type Attempt = {
  id: number; exam_id: number; user_id: number; started_at: string; deadline_at: string; finished_at: string | null;
  status: AttemptStatus; switches: number; layout: Layout; answers: Record<string, number>;
  correct: number | null; total: number | null; score: number | null; events: { type: string; at: string }[];
};

// Ordre propre à chaque élève : questions et réponses mélangées.
type Layout = { q: number; opts: number[] }[];

type AttemptRow = Omit<Attempt, "layout" | "answers" | "events"> & { layout: string; answers: string; events: string };

function parseAttempt(row: AttemptRow | undefined): Attempt | undefined {
  if (!row) return undefined;
  return { ...row, layout: JSON.parse(row.layout), answers: JSON.parse(row.answers), events: JSON.parse(row.events) };
}

export function getExamForCourse(courseId: number): Exam | undefined {
  const row = one<Omit<Exam, "questions"> & { questions: string }>("SELECT * FROM exams WHERE course_id = ?", courseId);
  return row ? { ...row, questions: JSON.parse(row.questions) } : undefined;
}

export function getExamById(examId: number): Exam | undefined {
  const row = one<Omit<Exam, "questions"> & { questions: string }>("SELECT * FROM exams WHERE id = ?", examId);
  return row ? { ...row, questions: JSON.parse(row.questions) } : undefined;
}

export function getAttempt(examId: number, userId: number) {
  return parseAttempt(one<AttemptRow>("SELECT * FROM exam_attempts WHERE exam_id = ? AND user_id = ?", examId, userId));
}

export function getAttemptById(id: number) {
  return parseAttempt(one<AttemptRow>("SELECT * FROM exam_attempts WHERE id = ?", id));
}

function shuffle(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function startAttempt(exam: Exam, userId: number) {
  const now = Date.now();
  const layout: Layout = shuffle(exam.questions.length).map((q) => ({ q, opts: shuffle(exam.questions[q].options.length) }));
  run(
    "INSERT INTO exam_attempts (exam_id, user_id, started_at, deadline_at, layout) VALUES (?, ?, ?, ?, ?)",
    exam.id, userId, new Date(now).toISOString(), new Date(now + exam.duration_minutes * 60_000).toISOString(), JSON.stringify(layout),
  );
  return getAttempt(exam.id, userId)!;
}

/** Questions dans l'ordre de l'élève, sans les bonnes réponses. */
export function questionsForAttempt(exam: Exam, attempt: Attempt) {
  return attempt.layout.map(({ q, opts }) => ({ question: exam.questions[q].question, options: opts.map((o) => exam.questions[q].options[o]) }));
}

function grade(exam: Exam, attempt: Attempt) {
  const correct = attempt.layout.filter(({ q, opts }, i) => {
    const chosen = attempt.answers[i];
    return chosen !== undefined && opts[chosen] === exam.questions[q].answer;
  }).length;
  const total = attempt.layout.length;
  return { correct, total, score: Math.round((correct / total) * 20 * 100) / 100 };
}

function finalize(exam: Exam, attempt: Attempt, status: Exclude<AttemptStatus, "in_progress">) {
  const { correct, total, score } = grade(exam, attempt);
  run(
    "UPDATE exam_attempts SET status = ?, finished_at = ?, correct = ?, total = ?, score = ? WHERE id = ? AND status = 'in_progress'",
    status, new Date().toISOString(), correct, total, score, attempt.id,
  );
  return getAttemptById(attempt.id)!;
}

/** Clôt la tentative si le temps est écoulé. À appeler avant toute lecture ou écriture. */
export function refreshAttempt(exam: Exam, attempt: Attempt) {
  if (attempt.status === "in_progress" && Date.now() >= Date.parse(attempt.deadline_at)) return finalize(exam, attempt, "expired");
  return attempt;
}

function validAnswers(exam: Exam, attempt: Attempt, answers: Record<string, unknown>) {
  const clean: Record<string, number> = {};
  for (const [k, v] of Object.entries(answers)) {
    const i = Number(k);
    const slot = attempt.layout[i];
    if (slot && Number.isInteger(v) && (v as number) >= 0 && (v as number) < slot.opts.length) clean[String(i)] = v as number;
  }
  return clean;
}

export function saveAnswers(exam: Exam, attempt: Attempt, answers: Record<string, unknown>) {
  attempt = refreshAttempt(exam, attempt);
  if (attempt.status !== "in_progress") return attempt;
  run("UPDATE exam_attempts SET answers = ? WHERE id = ? AND status = 'in_progress'", JSON.stringify(validAnswers(exam, attempt, answers)), attempt.id);
  return getAttemptById(attempt.id)!;
}

export function submitAttempt(exam: Exam, attempt: Attempt, answers: Record<string, unknown>) {
  attempt = saveAnswers(exam, attempt, answers);
  return attempt.status === "in_progress" ? finalize(exam, attempt, "submitted") : attempt;
}

// Un même changement d'onglet peut émettre plusieurs événements rapprochés : on n'en compte qu'un.
const SWITCH_DEBOUNCE_MS = 2000;

/** Changement d'onglet : pénalité de temps, puis fin de l'examen au dernier changement autorisé. */
export function recordTabSwitch(exam: Exam, attempt: Attempt) {
  attempt = refreshAttempt(exam, attempt);
  if (attempt.status !== "in_progress") return attempt;
  const last = attempt.events.filter((e) => e.type === "switch").at(-1);
  if (last && Date.now() - Date.parse(last.at) < SWITCH_DEBOUNCE_MS) return attempt;
  const switches = attempt.switches + 1;
  const deadline = Date.parse(attempt.deadline_at) - exam.penalty_minutes * 60_000;
  const events = [...attempt.events, { type: "switch", at: new Date().toISOString() }];
  run(
    "UPDATE exam_attempts SET switches = ?, deadline_at = ?, events = ? WHERE id = ? AND status = 'in_progress'",
    switches, new Date(deadline).toISOString(), JSON.stringify(events), attempt.id,
  );
  attempt = getAttemptById(attempt.id)!;
  if (switches >= exam.max_switches) return finalize(exam, attempt, "terminated");
  return refreshAttempt(exam, attempt);
}

export function deleteAttempt(attemptId: number) {
  run("DELETE FROM exam_attempts WHERE id = ?", attemptId);
}

export type AttemptResult = {
  id: number; user_name: string; user_email: string; university: string | null; program: string | null; study_level: string | null; started_at: string; finished_at: string | null; deadline_at: string;
  status: AttemptStatus; switches: number; correct: number | null; total: number | null; score: number | null;
};

export function listAttempts(exam: Exam) {
  const rows = all<AttemptRow & { user_name: string; user_email: string; university: string | null; program: string | null; study_level: string | null }>(
    `SELECT a.*, u.name AS user_name, u.email AS user_email, u.university, u.program, u.study_level FROM exam_attempts a JOIN users u ON u.id = a.user_id
     WHERE a.exam_id = ? ORDER BY u.name`,
    exam.id,
  );
  // Les tentatives dont le temps est écoulé sont notées au moment où l'enseignant consulte les résultats.
  return rows.map((r) => {
    const attempt = refreshAttempt(exam, parseAttempt(r)!);
    return { ...attempt, user_name: r.user_name, user_email: r.user_email, university: r.university, program: r.program, study_level: r.study_level } as AttemptResult;
  });
}

export const STATUS_LABELS: Record<AttemptStatus, string> = {
  in_progress: "En cours",
  submitted: "Rendu",
  expired: "Temps écoulé",
  terminated: "Arrêté (changements d'onglet)",
};
