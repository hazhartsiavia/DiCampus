import { canTeach, getCurrentUser } from "@/lib/auth";
import { STATUS_LABELS, getExamForCourse, listAttempts } from "@/lib/exams";
import { getEditableCourse } from "@/lib/teaching";

// Une cellule CSV : guillemets doublés, et neutralisation des formules (=, +, -, @) pour les tableurs.
function cell(value: string | number | null) {
  const s = value === null ? "" : String(value);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !canTeach(user)) return new Response("Accès refusé", { status: 403 });
  const course = getEditableCourse(Number((await params).id), user);
  const exam = course ? getExamForCourse(course.id) : undefined;
  if (!course || !exam) return new Response("Introuvable", { status: 404 });

  const rows = [
    ["Élève", "E-mail", "Université", "Parcours", "Niveau", "Note sur 20", "Bonnes réponses", "Questions", "Statut", "Changements d'onglet", "Début", "Fin"],
    ...listAttempts(exam).map((a) => [
      a.user_name, a.user_email, a.university, a.program, a.study_level, a.score === null ? null : String(a.score).replace(".", ","), a.correct, a.total,
      STATUS_LABELS[a.status], a.switches, a.started_at, a.finished_at,
    ]),
  ];
  // Point-virgule et BOM : ouverture directe dans Excel en français.
  const csv = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="notes-${course.slug}.csv"`,
    },
  });
}
