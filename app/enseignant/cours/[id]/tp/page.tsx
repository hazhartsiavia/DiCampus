import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { gradeTp } from "../../../actions";
import { GradeForm } from "@/components/tp";
import { profileLine } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { getEditableCourse } from "@/lib/teaching";
import { listSubmissions, listTpItems } from "@/lib/tp";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tp?: string }> };

export const metadata: Metadata = { title: "Travaux pratiques" };

function formatDate(iso: string) {
  return new Date(`${iso.replace(" ", "T")}Z`).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export default async function TpGradingPage({ params, searchParams }: Props) {
  const user = await requireTeacher();
  const course = getEditableCourse(Number((await params).id), user);
  if (!course) notFound();
  const tps = listTpItems(course.id);
  const { tp } = await searchParams;
  const current = tps.find((t) => t.id === Number(tp));
  // Sans TP choisi, on ouvre le premier à corriger ; l'adresse le fixe pour que la page n'en change pas après une notation.
  const fallback = tps.find((t) => t.to_grade > 0) ?? tps[0];
  if (!current && fallback) redirect(`/enseignant/cours/${course.id}/tp?tp=${fallback.id}`);
  const submissions = current ? listSubmissions(current.id) : [];
  const graded = submissions.filter((s) => s.grade !== null);
  const avg = graded.length ? graded.reduce((n, s) => n + s.grade!, 0) / graded.length : null;

  return (
    <div className="container-page py-12">
      <Link href={`/enseignant/cours/${course.id}`} className="text-sm text-ink-soft hover:underline">← {course.title}</Link>
      <p className="eyebrow mt-6">Correction</p>
      <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Travaux pratiques</h1>

      {tps.length === 0 ? (
        <p className="mt-10 rounded-card bg-surface p-6 text-ink-soft">
          Ce cours n&apos;a pas encore de TP. Ajoutez-en depuis l&apos;éditeur du cours avec le bouton « + TP » d&apos;une séance.
        </p>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_1fr]">
          <nav className="space-y-2 lg:sticky lg:top-6 lg:self-start">
            {tps.map((t) => (
              <Link
                key={t.id}
                href={`/enseignant/cours/${course.id}/tp?tp=${t.id}`}
                className={`block rounded-card p-4 text-sm transition-colors ${t.id === current?.id ? "bg-brand text-white" : "bg-surface hover:bg-hairline"}`}
              >
                <p className={`text-xs ${t.id === current?.id ? "text-white/60" : "text-ink-soft"}`}>{t.module_title}</p>
                <p className="mt-1 font-medium">{t.title}</p>
                <p className={`mt-2 text-xs ${t.id === current?.id ? "text-white/75" : "text-ink-soft"}`}>
                  {t.total} rendu{t.total > 1 ? "s" : ""}
                  {t.to_grade > 0 && <span className="ml-2 rounded-pill bg-accent px-2 py-0.5 font-medium text-ink">{t.to_grade} à corriger</span>}
                </p>
              </Link>
            ))}
          </nav>

          <section className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{current!.title}</h2>
              <p className="text-sm text-ink-soft">
                {graded.length}/{submissions.length} corrigé{graded.length > 1 ? "s" : ""}
                {avg !== null && <> · moyenne {avg.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}/20</>}
              </p>
            </div>
            {submissions.length === 0 ? (
              <p className="mt-6 rounded-card bg-surface p-6 text-ink-soft">Aucun rendu pour ce TP.</p>
            ) : (
              <ul className="mt-6 space-y-5">
                {submissions.map((s) => (
                  <li key={s.id} className="rounded-card border border-hairline p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{s.user_name}</p>
                        <p className="text-xs text-ink-soft">{s.user_email} · rendu le {formatDate(s.submitted_at)}</p>
                        {profileLine(s) && <p className="text-xs text-ink-soft">{profileLine(s)}</p>}
                      </div>
                      <span className={`rounded-pill px-3 py-1 text-xs font-medium ${s.grade === null ? "bg-amber-100 text-amber-900" : "bg-brand-50 text-brand-800"}`}>
                        {s.grade === null ? "À corriger" : `${s.grade.toLocaleString("fr-FR")}/20`}
                      </span>
                    </div>
                    <div className="mt-4 max-h-96 overflow-y-auto whitespace-pre-line rounded-xl bg-surface p-4 text-sm leading-relaxed">{s.text}</div>
                    {s.link && (
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block break-all text-sm text-brand underline">{s.link}</a>
                    )}
                    <div className="mt-4 border-t border-hairline pt-4">
                      <GradeForm action={gradeTp.bind(null, course.id, s.id)} grade={s.grade} feedback={s.feedback} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
