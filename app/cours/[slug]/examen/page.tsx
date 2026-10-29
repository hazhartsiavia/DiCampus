import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { startExam } from "./actions";
import { requireUser } from "@/lib/auth";
import { STATUS_LABELS, getAttempt, getExamForCourse, refreshAttempt } from "@/lib/exams";
import { completedItemIds, getCourse, getEnrollment, getModules } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Examen final" };

export default async function ExamIntroPage({ params }: Props) {
  const { slug } = await params;
  const course = getCourse(slug);
  const exam = course ? getExamForCourse(course.id) : undefined;
  if (!course || !exam || course.status !== "published") notFound();
  const user = await requireUser(`/cours/${slug}/examen`);
  const enrolled = !!getEnrollment(user.id, course.id);
  const found = getAttempt(exam.id, user.id);
  const attempt = found ? refreshAttempt(exam, found) : undefined;
  if (attempt?.status === "in_progress") redirect(`/cours/${slug}/examen/passer`);

  const items = getModules(course.id).flatMap((m) => m.items);
  const done = completedItemIds(user.id, course.id).size;

  return (
    <div className="container-page max-w-4xl py-12">
      <Link href={`/cours/${slug}`} className="text-sm text-ink-soft hover:underline">← {course.title}</Link>
      <p className="eyebrow mt-8">Examen final</p>
      <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight [overflow-wrap:anywhere] sm:text-6xl">{exam.title.replace(/^Examen final — /, "")}</h1>

      {attempt ? (
        <div className="mt-10 rounded-card-lg bg-surface p-8 text-center">
          <p className="text-sm text-ink-soft">{STATUS_LABELS[attempt.status]} · {attempt.switches} changement{attempt.switches > 1 ? "s" : ""} d&apos;onglet</p>
          <p className="mt-4 text-[6rem] font-medium leading-none tracking-tight text-brand">
            {attempt.score?.toLocaleString("fr-FR")}<span className="text-3xl text-ink-soft">/20</span>
          </p>
          <p className="mt-3 text-ink-soft">{attempt.correct} bonnes réponses sur {attempt.total}. Une seule tentative est autorisée.</p>
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              [`${exam.duration_minutes} min`, "pour répondre à toutes les questions"],
              [`${exam.questions.length}`, "questions à choix multiples, notées sur 20"],
              ["1", "seule tentative, sans retour possible"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-card bg-surface p-6">
                <p className="text-4xl font-medium tracking-tight">{value}</p>
                <p className="mt-2 text-sm text-ink-soft">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-card-lg bg-brand p-6 text-white sm:p-8">
            <p className="eyebrow-light">Règles de surveillance</p>
            <ul className="mt-4 space-y-3 text-white/85">
              <li>• Restez sur l&apos;onglet de l&apos;examen du début à la fin.</li>
              <li>• Chaque changement d&apos;onglet ou réduction de la fenêtre <strong className="font-medium text-white">retire {exam.penalty_minutes} minutes</strong> et déclenche un avertissement.</li>
              <li>• Au <strong className="font-medium text-white">{exam.max_switches}<sup>e</sup> changement</strong>, l&apos;examen s&apos;arrête : votre copie est notée avec les réponses déjà données.</li>
              <li>• Vos réponses sont enregistrées automatiquement ; à la fin du temps, la copie est rendue d&apos;office.</li>
              <li>• Votre note est transmise à votre enseignant.</li>
            </ul>
          </div>

          {!exam.is_open ? (
            <p className="mt-8 rounded-card bg-amber-50 p-5 text-amber-900">
              <strong className="font-bold">L&apos;examen est fermé pour le moment.</strong> Votre enseignant l&apos;ouvrira le jour de l&apos;épreuve : revenez sur cette page à ce moment-là.
            </p>
          ) : !enrolled ? (
            <p className="mt-8 rounded-card bg-amber-50 p-4 text-sm text-amber-900">
              Inscrivez-vous au cours pour passer l&apos;examen. <Link href={`/cours/${slug}`} className="font-medium underline">Aller au cours</Link>
            </p>
          ) : (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <form action={startExam.bind(null, slug)}>
                <button className="btn-primary">Commencer l&apos;examen ({exam.duration_minutes} min)</button>
              </form>
              <p className="text-sm text-ink-soft">
                {done < items.length ? `Conseil : vous avez terminé ${done}/${items.length} éléments du cours.` : "Vous avez terminé tout le cours, bonne chance !"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
