import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ExamRunner } from "@/components/exam-runner";
import { requireUser } from "@/lib/auth";
import { getAttempt, getExamForCourse, questionsForAttempt, refreshAttempt } from "@/lib/exams";
import { getCourse } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Examen en cours" };

export default async function ExamPage({ params }: Props) {
  const { slug } = await params;
  const course = getCourse(slug);
  const exam = course ? getExamForCourse(course.id) : undefined;
  if (!course || !exam) notFound();
  const user = await requireUser(`/cours/${slug}/examen`);
  const found = getAttempt(exam.id, user.id);
  if (!found) redirect(`/cours/${slug}/examen`);
  const attempt = refreshAttempt(exam, found);
  if (attempt.status !== "in_progress") redirect(`/cours/${slug}/examen`);

  return (
    <div className="container-page py-6">
      <ExamRunner
        attemptId={attempt.id}
        slug={slug}
        title={exam.title}
        questions={questionsForAttempt(exam, attempt)}
        initialAnswers={attempt.answers}
        initialState={{
          status: attempt.status,
          deadline: Date.parse(attempt.deadline_at),
          serverNow: Date.now(),
          switches: attempt.switches,
          score: null,
          correct: null,
          total: null,
        }}
        penaltyMinutes={exam.penalty_minutes}
        maxSwitches={exam.max_switches}
      />
    </div>
  );
}
