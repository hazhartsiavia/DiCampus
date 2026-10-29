import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resetExamAttempt, setExamOpen } from "../../../actions";
import { profileLine } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { STATUS_LABELS, getExamForCourse, listAttempts } from "@/lib/exams";
import { getEditableCourse } from "@/lib/teaching";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Notes de l'examen" };

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";
}

function duration(start: string, end: string | null) {
  if (!end) return "—";
  const min = Math.round((Date.parse(end) - Date.parse(start)) / 60_000);
  return `${min} min`;
}

export default async function ExamResultsPage({ params }: Props) {
  const user = await requireTeacher();
  const course = getEditableCourse(Number((await params).id), user);
  const exam = course ? getExamForCourse(course.id) : undefined;
  if (!course || !exam) notFound();
  const attempts = listAttempts(exam);
  const graded = attempts.filter((a) => a.score !== null);
  const scores = graded.map((a) => a.score!);
  const avg = scores.length ? scores.reduce((s, x) => s + x, 0) / scores.length : null;
  const fmt = (n: number | null) => (n === null ? "—" : n.toLocaleString("fr-FR", { maximumFractionDigits: 2 }));

  return (
    <div className="container-page py-12">
      <Link href={`/enseignant/cours/${course.id}`} className="text-sm text-ink-soft hover:underline">← {course.title}</Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Examen final · {exam.duration_minutes} min · {exam.questions.length} questions</p>
          <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Notes</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-pill px-3 py-1 text-sm font-semibold ${exam.is_open ? "bg-mint-50 text-teal" : "bg-amber-100 text-amber-900"}`}>
            {exam.is_open ? "Examen ouvert" : "Examen fermé"}
          </span>
          <form action={setExamOpen.bind(null, course.id, !exam.is_open)}>
            <button className={exam.is_open ? "btn-outline" : "btn-primary"}>{exam.is_open ? "Fermer l'examen" : "Ouvrir l'examen"}</button>
          </form>
          {attempts.length > 0 && (
            <a href={`/enseignant/cours/${course.id}/examen/export`} className="btn-outline">Exporter (CSV)</a>
          )}
        </div>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Copies", String(attempts.length)],
          ["Moyenne", avg === null ? "—" : `${fmt(avg)}/20`],
          ["Meilleure note", scores.length ? `${fmt(Math.max(...scores))}/20` : "—"],
          ["Arrêtés (onglets)", String(attempts.filter((a) => a.status === "terminated").length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-card bg-surface p-5">
            <dt className="text-xs text-ink-soft">{label}</dt>
            <dd className="mt-2 text-3xl font-medium tracking-tight">{value}</dd>
          </div>
        ))}
      </dl>

      {attempts.length === 0 ? (
        <p className="mt-8 rounded-card bg-surface p-6 text-ink-soft">Aucun élève n&apos;a encore passé l&apos;examen.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-card border border-hairline">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-surface text-xs text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Élève</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 font-medium">Bonnes réponses</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Onglets quittés</th>
                <th className="px-4 py-3 font-medium">Début</th>
                <th className="px-4 py-3 font-medium">Durée</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.user_name}</p>
                    <p className="text-xs text-ink-soft">{a.user_email}</p>
                    {profileLine(a) && <p className="text-xs text-ink-soft">{profileLine(a)}</p>}
                  </td>
                  <td className="px-4 py-3 text-lg font-medium">{a.score === null ? "—" : `${fmt(a.score)}/20`}</td>
                  <td className="px-4 py-3">{a.correct === null ? "—" : `${a.correct}/${a.total}`}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-pill px-2.5 py-1 text-xs font-medium ${
 a.status === "terminated" ? "bg-red-50 text-red-800" : a.status === "in_progress" ? "bg-amber-100 text-amber-900" : "bg-brand-50 text-brand-800"
 }`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${a.switches > 0 ? "font-medium text-red-700" : ""}`}>{a.switches}/{exam.max_switches}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(a.started_at)}</td>
                  <td className="px-4 py-3 text-ink-soft">{duration(a.started_at, a.finished_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={resetExamAttempt.bind(null, course.id, a.id)}>
                      <button className="text-xs text-ink-soft hover:text-red-700 hover:underline" title="Supprime cette copie : l'élève pourra repasser l'examen">
                        Autoriser à repasser
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-ink-soft">
        Règles : {exam.duration_minutes} min, −{exam.penalty_minutes} min par changement d&apos;onglet, arrêt au {exam.max_switches}<sup>e</sup>. Les copies dont le temps est écoulé sont notées automatiquement.
      </p>
    </div>
  );
}
