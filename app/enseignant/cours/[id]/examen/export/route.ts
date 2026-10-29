import { canTeach, getCurrentUser } from "@/lib/auth";
import { csvResponse, frNumber } from "@/lib/csv";
import { STATUS_LABELS, getExamForCourse, listAttempts } from "@/lib/exams";
import { getEditableCourse } from "@/lib/teaching";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !canTeach(user)) return new Response("Accès refusé", { status: 403 });
  const course = getEditableCourse(Number((await params).id), user);
  const exam = course ? getExamForCourse(course.id) : undefined;
  if (!course || !exam) return new Response("Introuvable", { status: 404 });

  const rows = [
    ["Élève", "E-mail", "Université", "Parcours", "Niveau", "Note sur 20", "Bonnes réponses", "Questions", "Statut", "Changements d'onglet", "Début", "Fin"],
    ...listAttempts(exam).map((a) => [
      a.user_name, a.user_email, a.university, a.program, a.study_level, frNumber(a.score), a.correct, a.total,
      STATUS_LABELS[a.status], a.switches, a.started_at, a.finished_at,
    ]),
  ];
  return csvResponse(`notes-${course.slug}.csv`, rows);
}
