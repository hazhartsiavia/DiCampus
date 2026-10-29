"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getAttempt, getAttemptById, getExamById, getExamForCourse, recordTabSwitch, refreshAttempt, saveAnswers, startAttempt, submitAttempt,
  type Attempt, type Exam,
} from "@/lib/exams";
import { getCourse, getEnrollment } from "@/lib/queries";

export type ExamState = {
  status: Attempt["status"];
  deadline: number;
  serverNow: number;
  switches: number;
  score: number | null;
  correct: number | null;
  total: number | null;
};

function stateOf(attempt: Attempt): ExamState {
  return {
    status: attempt.status,
    deadline: Date.parse(attempt.deadline_at),
    serverNow: Date.now(),
    switches: attempt.switches,
    score: attempt.score,
    correct: attempt.correct,
    total: attempt.total,
  };
}

export async function startExam(slug: string) {
  const user = await requireUser(`/cours/${slug}/examen`);
  const course = getCourse(slug);
  const exam = course ? getExamForCourse(course.id) : undefined;
  if (!course || !exam || course.status !== "published") redirect("/");
  if (!getEnrollment(user.id, course.id)) redirect(`/cours/${slug}`);
  if (!getAttempt(exam.id, user.id)) {
    if (!exam.is_open) redirect(`/cours/${slug}/examen`);
    startAttempt(exam, user.id);
  }
  redirect(`/cours/${slug}/examen/passer`);
}

/** La tentative de l'élève connecté, avec son examen, ou une erreur. */
async function ownAttempt(attemptId: number): Promise<{ exam: Exam; attempt: Attempt }> {
  const user = await requireUser();
  const attempt = getAttemptById(attemptId);
  if (!attempt || attempt.user_id !== user.id) throw new Error("Tentative introuvable.");
  const exam = getExamById(attempt.exam_id)!;
  return { exam, attempt: refreshAttempt(exam, attempt) };
}

export async function reportTabSwitch(attemptId: number): Promise<ExamState> {
  const { exam, attempt } = await ownAttempt(attemptId);
  return stateOf(recordTabSwitch(exam, attempt));
}

export async function saveExamAnswers(attemptId: number, answers: Record<string, number>): Promise<ExamState> {
  const { exam, attempt } = await ownAttempt(attemptId);
  return stateOf(saveAnswers(exam, attempt, answers));
}

export async function submitExam(attemptId: number, answers: Record<string, number>): Promise<ExamState> {
  const { exam, attempt } = await ownAttempt(attemptId);
  return stateOf(submitAttempt(exam, attempt, answers));
}
