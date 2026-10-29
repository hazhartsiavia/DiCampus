import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { enroll, submitReview, toggleSave } from "@/app/actions";
import { Mark } from "@/components/icons";
import { ReviewForm } from "@/components/review-form";
import { CourseGrid, ProgressBar, Stars, itemIcon, itemLabel } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getAttempt, getExamForCourse } from "@/lib/exams";
import {
  completedItemIds, getCourse, getEnrollment, getModules, getReviews, isSaved,
  searchCourses, specializationsForCourse,
} from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).slug);
  return { title: course?.title ?? "Cours", description: course?.subtitle };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  // Un brouillon n'est visible que de son auteur et des administrateurs.
  if (course.status !== "published" && !(user && (course.owner_id === user.id || user.isAdmin))) notFound();
  const exam = getExamForCourse(course.id);
  const examAttempt = exam && user ? getAttempt(exam.id, user.id) : undefined;
  const modules = getModules(course.id);
  const reviews = getReviews(course.id);
  const specs = specializationsForCourse(course.id);
  const enrollment = user ? getEnrollment(user.id, course.id) : undefined;
  const done = user ? completedItemIds(user.id, course.id) : new Set<number>();
  const saved = user ? isSaved(user.id, course.id) : false;
  const allItems = modules.flatMap((m) => m.items);
  const nextItem = allItems.find((i) => !done.has(i.id)) ?? allItems[0];
  const myReview = user ? reviews.find((r) => r.user_id === user.id) : undefined;
  const similar = searchCourses({ domain: course.domain_slug }).filter((c) => c.id !== course.id).slice(0, 4);
  const totalMinutes = allItems.reduce((s, i) => s + i.minutes, 0);

  return (
    <>
      <section className="bg-surface">
        <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_340px] lg:py-14">
          <div>
            <nav className="text-sm text-ink-soft">
              <Link href="/explorer" className="hover:underline">Explorer</Link> /{" "}
              <Link href={`/explorer/${course.domain_slug}`} className="hover:underline">{course.domain_name}</Link>
            </nav>
            <p className="mt-5 text-sm font-medium text-brand-700">{course.partner_name}</p>
            <h1 className="mt-2 text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">{course.title}</h1>
            <p className="mt-3 text-lg text-ink-soft">{course.subtitle}</p>
            <p className="mt-4 text-sm text-ink-soft">
              <strong className="text-ink">{course.instructor_name}</strong> · {course.instructor_title}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {course.rating ? (
                <span className="flex items-center gap-1.5">
                  <strong>{course.rating.toFixed(1)}</strong> <Stars rating={course.rating} /> <span className="text-ink-soft">({course.review_count} avis)</span>
                </span>
              ) : (
                <span className="text-ink-soft">Pas encore d&apos;avis</span>
              )}
              <span className="text-ink-soft">{course.learners} inscrit{course.learners > 1 ? "s" : ""}</span>
            </div>
          </div>

          <aside className="self-start rounded-card border border-hairline bg-white p-6 shadow-sm">
            {enrollment ? (
              <>
                <p className="text-sm font-medium text-brand-700">{enrollment.completed_at ? "Cours terminé 🎉" : "Vous suivez ce cours"}</p>
                <div className="my-3"><ProgressBar value={(done.size / allItems.length) * 100} /></div>
                <p className="mb-4 text-xs text-ink-soft">{done.size}/{allItems.length} éléments terminés</p>
                <Link href={`/cours/${course.slug}/apprendre/${nextItem.id}`} className="btn-primary w-full">
                  {enrollment.completed_at ? "Revoir le cours" : done.size ? "Continuer" : "Commencer"}
                </Link>
                {enrollment.certificate_code && (
                  <Link href={`/certificats/${enrollment.certificate_code}`} className="btn-outline mt-2 w-full">Voir mon certificat</Link>
                )}
              </>
            ) : (
              <>
                <p className="text-2xl font-medium">Gratuit</p>
                <p className="mb-4 text-sm text-ink-soft">Accès complet aux vidéos, lectures, quiz et au certificat.</p>
                <form action={enroll.bind(null, course.id, course.slug)}>
                  <button className="btn-primary w-full">S&apos;inscrire au cours</button>
                </form>
              </>
            )}
            <form action={toggleSave.bind(null, course.id, course.slug)} className="mt-2">
              <button className="btn-ghost w-full">{saved ? "♥ Enregistré" : "♡ Enregistrer pour plus tard"}</button>
            </form>
            {exam && (
              <Link href={`/cours/${course.slug}/examen`} className="mt-4 block rounded-card bg-brand p-4 text-white">
                <span className="text-xs text-white/60">Examen final</span>
                <span className="mt-1 block font-medium">
                  {examAttempt?.score != null ? `Votre note : ${examAttempt.score.toLocaleString("fr-FR")}/20` : `${exam.duration_minutes} min · ${exam.questions.length} questions · surveillé`}
                </span>
              </Link>
            )}
            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-hairline pt-5 text-sm">
              <div><dt className="text-ink-soft">Niveau</dt><dd className="font-medium">{course.level}</dd></div>
              <div><dt className="text-ink-soft">Durée</dt><dd className="font-medium">{course.hours} h environ</dd></div>
              <div><dt className="text-ink-soft">Modules</dt><dd className="font-medium">{modules.length}</dd></div>
              <div><dt className="text-ink-soft">Langue</dt><dd className="font-medium">Français</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <nav className="no-print sticky top-[4.5rem] z-20 border-b border-hairline bg-white/95 backdrop-blur lg:top-24">
        <div className="container-page flex gap-6 overflow-x-auto text-sm font-medium">
          {[["a-propos", "À propos"], ["modules", "Modules"], ["equipe", "Équipe"], ["avis", "Avis"]].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap border-b-2 border-transparent py-3 hover:border-brand-700 hover:text-brand-700">{label}</a>
          ))}
        </div>
      </nav>

      <div className="container-page max-w-5xl space-y-14 py-10">
        <section id="a-propos" className="scroll-mt-40">
          <h2 className="text-2xl font-bold">Ce que vous apprendrez</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {course.outcomes.map((o) => (
              <li key={o} className="flex gap-2 text-sm"><span className="text-brand-600">✓</span>{o}</li>
            ))}
          </ul>
          <h3 className="mt-8 font-bold">Compétences que vous développerez</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {course.skills.map((s) => (
              <Link key={s} href={`/recherche?q=${encodeURIComponent(s)}`} className="chip hover:bg-brand-100">{s}</Link>
            ))}
          </div>
          <h3 className="mt-8 font-bold">Description</h3>
          <p className="mt-2 leading-relaxed text-ink-soft">{course.description}</p>
          {specs.length > 0 && (
            <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-5">
              <p className="text-sm font-medium text-brand-800">Ce cours fait partie {specs.length > 1 ? "des parcours" : "du parcours"} :</p>
              <ul className="mt-2 space-y-1">
                {specs.map((s) => (
                  <li key={s.slug}><Link href={`/parcours/${s.slug}`} className="font-medium hover:underline">{s.title}</Link> <span className="text-sm text-ink-soft">· {s.course_count} cours</span></li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section id="modules" className="scroll-mt-40">
          <h2 className="text-2xl font-bold">Il y a {modules.length} modules dans ce cours</h2>
          <p className="mt-1 text-sm text-ink-soft">{allItems.length} éléments · environ {Math.round(totalMinutes / 6) / 10} h de contenu guidé</p>
          <div className="mt-5 divide-y divide-hairline rounded-xl border border-hairline">
            {modules.map((m) => {
              const moduleDone = m.items.filter((i) => done.has(i.id)).length;
              return (
                <details key={m.id} className="group" open={m.position === 1}>
                  <summary className="flex cursor-pointer list-none items-center gap-4 p-5 hover:bg-surface">
                    <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-brand-100 text-sm font-medium text-brand-800">{m.position}</span>
                    <div className="flex-1">
                      <p className="font-medium">{m.title}</p>
                      <p className="text-sm text-ink-soft">{m.summary}</p>
                    </div>
                    {enrollment && <span className="text-xs text-ink-soft">{moduleDone}/{m.items.length}</span>}
                    <span className="text-ghost transition group-open:rotate-180">▾</span>
                  </summary>
                  <ul className="space-y-1 px-5 pb-5 pl-[4.25rem]">
                    {m.items.map((i) => (
                      <li key={i.id} className="flex items-center gap-3 text-sm">
                        <span className={`grid size-6 place-items-center rounded text-xs ${done.has(i.id) ? "bg-brand-600 text-white" : "bg-surface text-ink-soft"}`}>
                          {done.has(i.id) ? "✓" : itemIcon(i.kind)}
                        </span>
                        {enrollment ? (
                          <Link href={`/cours/${course.slug}/apprendre/${i.id}`} className="flex-1 hover:text-brand-700 hover:underline">{i.title}</Link>
                        ) : (
                          <span className="flex-1">{i.title}</span>
                        )}
                        <span className="text-xs text-ink-soft">{itemLabel(i.kind)} · {i.minutes} min</span>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
        </section>

        <section id="equipe" className="scroll-mt-40">
          <h2 className="text-2xl font-bold">Équipe pédagogique et établissement</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-xl border border-hairline p-5">
              <span className="grid size-14 place-items-center rounded-pill bg-brand-700 text-lg font-medium text-white">
                <Mark className="size-6" />
              </span>
              <div>
                <p className="font-medium">{course.instructor_name}</p>
                <p className="text-sm text-ink-soft">{course.instructor_title}</p>
              </div>
            </div>
            <div className="rounded-xl border border-hairline p-5">
              <p className="font-medium">{course.partner_name}</p>
              <p className="text-sm text-ink-soft">{course.partner_description}</p>
              <Link href={`/explorer?partenaire=${course.partner_slug}`} className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline">Voir ses cours →</Link>
            </div>
          </div>
        </section>

        <section id="avis" className="scroll-mt-40">
          <h2 className="text-2xl font-bold">Avis des apprenants</h2>
          {course.rating && (
            <p className="mt-2 flex items-center gap-2"><span className="text-3xl font-medium">{course.rating.toFixed(1)}</span><Stars rating={course.rating} size="text-lg" /><span className="text-sm text-ink-soft">{course.review_count} avis</span></p>
          )}
          <div className="mt-5 space-y-4">
            {enrollment && (
              <ReviewForm action={submitReview.bind(null, course.id, course.slug)} initialRating={myReview?.rating} initialComment={myReview?.comment} />
            )}
            {reviews.length === 0 && <p className="text-sm text-ink-soft">Aucun avis pour l&apos;instant. {enrollment ? "Soyez le premier !" : "Inscrivez-vous pour donner le vôtre."}</p>}
            {reviews.map((r) => (
              <article key={r.id} className="rounded-xl border border-hairline p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-pill bg-hairline text-sm font-medium">{r.author[0].toUpperCase()}</span>
                  <div>
                    <p className="text-sm font-medium">{r.author}</p>
                    <Stars rating={r.rating} size="text-xs" />
                  </div>
                  <time className="ml-auto text-xs text-ink-soft">{new Date(r.created_at + "Z").toLocaleDateString("fr-FR")}</time>
                </div>
                <p className="mt-3 text-sm text-ink-soft">{r.comment}</p>
              </article>
            ))}
          </div>
        </section>

        {similar.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold">Dans le même domaine</h2>
            <div className="mt-5"><CourseGrid courses={similar} /></div>
          </section>
        )}
      </div>
    </>
  );
}
