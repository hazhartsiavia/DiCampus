import { canTeach, getCurrentUser } from "@/lib/auth";
import { csvResponse, frNumber } from "@/lib/csv";
import { STATUS_LABELS } from "@/lib/exams";
import { listCourseStudents, percent } from "@/lib/students";
import { getEditableCourse } from "@/lib/teaching";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !canTeach(user)) return new Response("Accès refusé", { status: 403 });
  const course = getEditableCourse(Number((await params).id), user);
  if (!course) return new Response("Introuvable", { status: 404 });

  const rows = [
    ["Étudiant", "E-mail", "Université", "Parcours", "Niveau", "Avancement (%)", "Éléments terminés", "TP rendus", "Moyenne TP", "Note examen", "Statut examen", "Inscrit le"],
    ...listCourseStudents(course.id).map((s) => [
      s.name, s.email, s.university, s.program, s.study_level, percent(s.done, s.total), `${s.done}/${s.total}`,
      s.tp_total ? `${s.tp_done}/${s.tp_total}` : null, frNumber(s.tp_avg), frNumber(s.exam_score),
      s.exam_status ? STATUS_LABELS[s.exam_status] : "Pas encore passé", s.enrolled_at,
    ]),
  ];
  return csvResponse(`etudiants-${course.slug}.csv`, rows);
}
