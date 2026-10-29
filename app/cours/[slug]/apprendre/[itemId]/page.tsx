import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { completeItem, submitTp } from "@/app/actions";
import { FlashCards, MatchActivity, Reflection } from "@/components/activities";
import { Quiz } from "@/components/quiz";
import { RichText } from "@/components/rich-text";
import { TpSubmission } from "@/components/tp";
import { ProgressBar, itemIcon, itemLabel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getExamForCourse } from "@/lib/exams";
import { completedItemIds, getCourse, getEnrollment, getModules, parseQuiz } from "@/lib/queries";
import { videoEmbed } from "@/lib/teaching";
import { getSubmission } from "@/lib/tp";

type Props = { params: Promise<{ slug: string; itemId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).slug);
  return { title: course ? `Apprendre · ${course.title}` : "Apprendre" };
}

// Activités qui gèrent elles-mêmes leur validation (réussite requise ou consultation complète).
const SELF_VALIDATING = new Set(["quiz", "cards", "match", "reflection", "tp"]);

export default async function LearnPage({ params }: Props) {
  const { slug, itemId } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const user = await requireUser(`/cours/${slug}`);
  const canEdit = course.owner_id === user.id || user.isAdmin;
  const enrollment = getEnrollment(user.id, course.id);
  // L'enseignant prévisualise son cours sans s'y inscrire ; la progression n'est alors pas enregistrée.
  const preview = !enrollment && canEdit;
  if (!enrollment && !preview) redirect(`/cours/${slug}`);
  if (course.status !== "published" && !canEdit) notFound();

  const modules = getModules(course.id);
  const items = modules.flatMap((m) => m.items);
  const index = items.findIndex((i) => i.id === Number(itemId));
  if (index === -1) notFound();
  const item = items[index];
  const prev = items[index - 1];
  const next = items[index + 1];
  const done = completedItemIds(user.id, course.id);
  const isDone = done.has(item.id);
  const currentModule = modules.find((m) => m.id === item.module_id)!;
  const complete = preview ? undefined : completeItem.bind(null, item.id, slug, next?.id ?? null);
  const exam = getExamForCourse(course.id);
  const embed = item.kind === "video" ? videoEmbed(item.video_url) : null;
  const submission = item.kind === "tp" ? getSubmission(item.id, user.id) ?? null : null;

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[300px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
        <Link href={`/cours/${slug}`} className="text-sm text-ink-soft hover:underline">← {course.title}</Link>
        <div className="mt-4 rounded-xl border border-hairline p-4">
          <p className="mb-2 text-xs text-ink-soft">{done.size}/{items.length} éléments terminés</p>
          <ProgressBar value={(done.size / items.length) * 100} />
        </div>
        <details className="mt-4 lg:hidden">
          <summary className="btn-outline w-full cursor-pointer list-none">Plan du cours</summary>
          <Outline />
        </details>
        <div className="hidden lg:block"><Outline /></div>
      </aside>

      <article className="min-w-0">
        {preview && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card bg-amber-50 p-4 text-sm text-amber-900">
            <p><strong className="font-medium">Mode aperçu enseignant</strong> : les élèves voient cette page ainsi ; rien n&apos;est enregistré.</p>
            <Link href={`/enseignant/cours/${course.id}`} className="font-medium underline">Retour à l&apos;édition</Link>
          </div>
        )}
        {enrollment?.completed_at && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card bg-gradient-to-r from-brand-deep to-brand p-5 text-white">
            <div>
              <p className="text-lg font-medium">Félicitations, vous avez terminé ce cours ! 🎉</p>
              <p className="text-sm text-white/75">{exam ? "Il vous reste l'examen final." : "Votre certificat est disponible."}</p>
            </div>
            {exam ? (
              <Link href={`/cours/${slug}/examen`} className="btn-light">Examen final</Link>
            ) : (
              <Link href={`/certificats/${enrollment.certificate_code}`} className="btn-light">Voir mon certificat</Link>
            )}
          </div>
        )}
        <p className="text-sm font-medium text-brand">{currentModule.title} · {itemLabel(item.kind)} · {item.minutes} min</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{item.title}</h1>

        <div className="mt-8">
          {item.kind === "video" && (
            <>
              {embed?.type === "youtube" ? (
                <iframe
                  src={embed.src}
                  title={item.title}
                  className="aspect-video w-full rounded-card"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : embed?.type === "file" ? (
                <video src={embed.src} controls preload="metadata" className="aspect-video w-full rounded-card bg-black" />
              ) : (
                <div className="grid aspect-video place-items-center overflow-hidden rounded-card" style={{ background: `linear-gradient(135deg, hsl(${course.hue} 60% 18%), hsl(${course.hue} 70% 35%))` }}>
                  <div className="text-center text-white">
                    <span className="mx-auto grid size-16 place-items-center rounded-pill bg-white/20 text-2xl backdrop-blur">▶</span>
                    <p className="mt-3 text-sm text-white/80">Vidéo à venir · {item.minutes} min</p>
                  </div>
                </div>
              )}
              {item.content && (
                <>
                  <h2 className="mt-8 font-bold">Transcription</h2>
                  <RichText text={item.content} className="mt-3" />
                </>
              )}
            </>
          )}
          {item.kind === "reading" && <RichText text={item.content} className="max-w-3xl" />}
          {item.kind === "tp" && (
            <div className="max-w-3xl space-y-8">
              <RichText text={item.content} />
              <TpSubmission
                itemId={item.id}
                action={preview ? undefined : submitTp.bind(null, item.id, slug)}
                submission={submission && { text: submission.text, link: submission.link, submitted_at: submission.submitted_at, grade: submission.grade, feedback: submission.feedback }}
              />
            </div>
          )}
          {item.kind === "quiz" && <Quiz questions={parseQuiz(item)} completeAction={complete} alreadyDone={isDone} />}
          {item.kind === "cards" && <FlashCards cards={JSON.parse(item.content)} completeAction={complete} alreadyDone={isDone} />}
          {item.kind === "match" && <MatchActivity {...JSON.parse(item.content)} seed={item.id} completeAction={complete} alreadyDone={isDone} />}
          {item.kind === "reflection" && <Reflection itemId={item.id} questions={JSON.parse(item.content)} completeAction={complete} alreadyDone={isDone} />}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-6">
          {prev ? <Link href={`/cours/${slug}/apprendre/${prev.id}`} className="btn-ghost">← Précédent</Link> : <span />}
          <div className="flex flex-wrap gap-2">
            {isDone && <span className="btn text-brand">✓ Terminé</span>}
            {!isDone && complete && !SELF_VALIDATING.has(item.kind) && (
              <form action={complete}><button className="btn-primary">Marquer comme terminé{next ? " et continuer" : ""}</button></form>
            )}
            {(isDone || preview) && next && <Link href={`/cours/${slug}/apprendre/${next.id}`} className="btn-primary">Suivant →</Link>}
            {!next && exam && <Link href={`/cours/${slug}/examen`} className="btn-primary">Examen final →</Link>}
          </div>
        </div>
      </article>
    </div>
  );

  function Outline() {
    return (
      <nav className="mt-4 space-y-5">
        {modules.map((m) => (
          <div key={m.id}>
            <p className="mb-2 text-sm font-medium">{m.title}</p>
            <ul className="space-y-0.5">
              {m.items.map((i) => (
                <li key={i.id}>
                  <Link
                    href={`/cours/${slug}/apprendre/${i.id}`}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${i.id === item.id ? "bg-brand-50 font-medium text-brand-800" : "hover:bg-surface"}`}
                  >
                    <span className={`grid size-5 shrink-0 place-items-center rounded text-[10px] ${done.has(i.id) ? "bg-brand text-white" : "bg-surface text-ink-soft"}`}>
                      {done.has(i.id) ? "✓" : itemIcon(i.kind)}
                    </span>
                    <span className="truncate">{i.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {exam && (
          <Link href={`/cours/${slug}/examen`} className="flex items-center gap-2 rounded-xl bg-brand px-3 py-2.5 text-sm font-medium text-white">
            <span className="grid size-5 place-items-center rounded bg-white/20 text-[10px]">★</span> Examen final · {exam.duration_minutes} min
          </Link>
        )}
      </nav>
    );
  }
}
