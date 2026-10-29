import type { Metadata } from "next";
import Link from "next/link";
import { requestTeacherAccess } from "./actions";
import { Arrow } from "@/components/icons";
import { RequestForm } from "@/components/teacher-forms";
import { Thumb } from "@/components/ui";
import { canTeach, requireUser } from "@/lib/auth";
import { getTeacherRequest, listEstablishmentOptions, myTeachingCourses } from "@/lib/teaching";

export const metadata: Metadata = { title: "Espace enseignant" };

export default async function TeacherHome() {
  const user = await requireUser("/enseignant");

  if (!canTeach(user)) {
    const request = getTeacherRequest(user.id);
    return (
      <div className="container-page max-w-3xl py-12">
        <p className="eyebrow">Espace enseignant</p>
        <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Publier vos cours</h1>
        <p className="mt-5 max-w-xl text-ink-soft">
          Les enseignants des établissements d&apos;Antsiranana peuvent créer leurs cours, quiz et examens sur DiCampus. L&apos;accès est validé par un administrateur.
        </p>
        <div className="mt-10 rounded-card-lg bg-surface p-6 sm:p-8">
          {request?.status === "pending" ? (
            <>
              <p className="text-lg font-medium">Demande en cours d&apos;examen</p>
              <p className="mt-2 text-sm text-ink-soft">Envoyée pour {request.partner_name}. Vous aurez accès à l&apos;espace enseignant dès sa validation.</p>
            </>
          ) : (
            <>
              {request?.status === "refused" && (
                <p className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Votre précédente demande n&apos;a pas été acceptée. Vous pouvez en envoyer une nouvelle.</p>
              )}
              <RequestForm action={requestTeacherAccess} establishments={listEstablishmentOptions()} />
            </>
          )}
        </div>
      </div>
    );
  }

  const courses = myTeachingCourses(user.id, user.isAdmin);
  const mine = courses.filter((c) => c.owner_id === user.id);
  const others = courses.filter((c) => c.owner_id !== user.id);

  const List = ({ items }: { items: typeof courses }) => (
    <ul className="mt-6 grid gap-4 md:grid-cols-2">
      {items.map((c) => (
        <li key={c.id}>
          <Link href={`/enseignant/cours/${c.id}`} className="hover-lift hover-nudge flex gap-4 rounded-card bg-surface p-4">
            <Thumb hue={c.hue} title={c.title} className="size-20 shrink-0 rounded-xl [&_span]:p-2 [&_span]:text-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`rounded-pill px-2 py-0.5 text-[0.65rem] font-medium ${c.status === "published" ? "bg-brand-50 text-brand-800" : "bg-amber-100 text-amber-900"}`}>
                  {c.status === "published" ? "Publié" : "Brouillon"}
                </span>
                {c.has_exam ? <span className="rounded-pill bg-brand-deep px-2 py-0.5 text-[0.65rem] font-medium text-white">Examen</span> : null}
              </div>
              <p className="mt-1 truncate font-medium">{c.title}</p>
              <p className="text-xs text-ink-soft">{c.modules} modules · {c.items} éléments · {c.learners} inscrit{c.learners > 1 ? "s" : ""}</p>
            </div>
            <span className="nudge self-center"><Arrow className="size-4" /></span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Espace enseignant</p>
          <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Mes cours</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {user.isAdmin && <Link href="/admin" className="btn-outline">Administration</Link>}
          <Link href="/enseignant/cours/nouveau" className="btn-primary hover-nudge">Nouveau cours <Arrow className="nudge size-4" /></Link>
        </div>
      </div>
      {mine.length ? <List items={mine} /> : <p className="mt-6 rounded-card bg-surface p-6 text-ink-soft">Vous n&apos;avez pas encore créé de cours.</p>}
      {others.length > 0 && (
        <section className="mt-16">
          <p className="eyebrow">Administration</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Tous les cours de la plateforme</h2>
          <List items={others} />
        </section>
      )}
    </div>
  );
}
