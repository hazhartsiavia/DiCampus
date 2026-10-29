import { getCurrentUser } from "@/lib/auth";
import { csvResponse } from "@/lib/csv";
import { listStudents, readFilters } from "@/lib/students";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return new Response("Accès refusé", { status: 403 });
  const filters = readFilters(Object.fromEntries(new URL(request.url).searchParams));
  const rows = [
    ["Nom", "Prénom", "E-mail", "Université", "Parcours", "Niveau", "Nombre de cours", "Cours suivis", "Inscrit le"],
    ...listStudents(filters).map((s) => [
      s.last_name ?? s.name, s.first_name, s.email, s.university, s.program, s.study_level, s.course_count, s.courses, s.created_at,
    ]),
  ];
  return csvResponse("etudiants-dicampus.csv", rows);
}
