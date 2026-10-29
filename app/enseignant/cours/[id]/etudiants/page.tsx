import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressBar, profileLine } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { STATUS_LABELS } from "@/lib/exams";
import { listCourseStudents, percent } from "@/lib/students";
import { getEditableCourse } from "@/lib/teaching";

export const metadata: Metadata = { title: "Étudiants du cours" };

type Props = { params: Promise<{ id: string }> };

function formatDate(sqlite: string) {
  return new Date(`${sqlite.replace(" ", "T")}Z`).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

export default async function CourseStudentsPage({ params }: Props) {
  const user = await requireTeacher();
  const course = getEditableCourse(Number((await params).id), user);
  if (!course) notFound();
  const students = listCourseStudents(course.id);
  const hasTp = students.some((s) => s.tp_total > 0);
  const finished = students.filter((s) => s.completed_at).length;
  const avgProgress = students.length ? Math.round(students.reduce((n, s) => n + percent(s.done, s.total), 0) / students.length) : 0;

  return (
    <div className="container-page py-12">
      <Link href={`/enseignant/cours/${course.id}`} className="text-sm text-ink-soft hover:underline">← {course.title}</Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">{course.title}</p>
          <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Étudiants inscrits</h1>
        </div>
        {students.length > 0 && <a href={`/enseignant/cours/${course.id}/etudiants/export`} className="btn-outline">Exporter (CSV)</a>}
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          ["Inscrits", String(students.length), "bg-brand-50"],
          ["Avancement moyen", `${avgProgress} %`, "bg-mint-50"],
          ["Cours terminé", String(finished), "bg-salmon-50"],
        ].map(([label, value, tint]) => (
          <div key={label} className={`rounded-card-lg p-6 ${tint}`}>
            <dt className="text-ink-soft">{label}</dt>
            <dd className="mt-2 text-4xl font-bold tracking-tight">{value}</dd>
          </div>
        ))}
      </dl>

      {students.length === 0 ? (
        <p className="mt-8 rounded-card-lg bg-surface p-6 text-ink-soft">Aucun étudiant n&apos;est encore inscrit à ce cours.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-card-lg border border-hairline">
          <table className="w-full min-w-[60rem] text-left">
            <thead className="bg-surface text-sm text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Étudiant</th>
                <th className="px-5 py-3 font-semibold">Avancement</th>
                {hasTp && <th className="px-5 py-3 font-semibold">TP rendus</th>}
                <th className="px-5 py-3 font-semibold">Examen</th>
                <th className="px-5 py-3 font-semibold">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {students.map((s) => {
                const p = percent(s.done, s.total);
                return (
                  <tr key={s.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-bold">{s.name}</p>
                      <p className="text-sm text-ink-soft">{s.email}</p>
                      {profileLine(s) && <p className="text-sm text-ink-soft">{profileLine(s)}</p>}
                    </td>
                    <td className="w-56 px-5 py-4">
                      <p className="mb-2 text-sm"><strong className="font-bold">{p} %</strong> <span className="text-ink-soft">· {s.done}/{s.total} éléments</span></p>
                      <ProgressBar value={p} />
                    </td>
                    {hasTp && (
                      <td className="px-5 py-4">
                        <p className="font-semibold">{s.tp_done}/{s.tp_total}</p>
                        {s.tp_avg !== null && <p className="text-sm text-ink-soft">moyenne {fmt(s.tp_avg)}/20</p>}
                      </td>
                    )}
                    <td className="px-5 py-4">
                      {s.exam_status ? (
                        <>
                          <p className="font-bold">{s.exam_score === null ? "—" : `${fmt(s.exam_score)}/20`}</p>
                          <p className="text-sm text-ink-soft">{STATUS_LABELS[s.exam_status]}</p>
                        </>
                      ) : (
                        <span className="text-sm text-ink-soft">Pas encore passé</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-soft">{formatDate(s.enrolled_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
