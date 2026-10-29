import type { Metadata } from "next";
import Link from "next/link";
import { setWeeklyGoal } from "@/app/actions";
import { EmptyState, ProgressBar, Thumb } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { activeDaysThisWeek, myCertificates, myCourses } from "@/lib/queries";

export const metadata: Metadata = { title: "Mon apprentissage" };

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

export default async function MyLearningPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const user = await requireUser("/mon-apprentissage");
  const { onglet } = await searchParams;
  const showDone = onglet === "termines";
  const courses = myCourses(user.id);
  const list = courses.filter((c) => (showDone ? c.completed_at : !c.completed_at));
  const activeDays = new Set(activeDaysThisWeek(user.id));
  const certificates = myCertificates(user.id);

  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - ((now.getUTCDay() + 6) % 7)));
  const week = DAYS.map((label, i) => {
    const d = new Date(monday.getTime() + i * 86_400_000).toISOString().slice(0, 10);
    return { label, active: activeDays.has(d) };
  });
  const goalReached = activeDays.size >= user.weekly_goal;

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Mon apprentissage</h1>
        <div className="mt-6 flex gap-2 border-b border-hairline">
          {[["", "En cours", courses.filter((c) => !c.completed_at).length], ["termines", "Terminés", courses.filter((c) => c.completed_at).length]].map(([key, label, n]) => (
            <Link
              key={key}
              href={key ? `/mon-apprentissage?onglet=${key}` : "/mon-apprentissage"}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${(onglet ?? "") === key ? "border-brand-700 text-brand-700" : "border-transparent text-ink-soft hover:text-ink"}`}
            >
              {label} ({n})
            </Link>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {list.length === 0 && (
            showDone
              ? <EmptyState title="Aucun cours terminé" text="Terminez tous les éléments d'un cours pour obtenir votre certificat." href="/mon-apprentissage" cta="Voir mes cours en cours" />
              : <EmptyState title="Vous ne suivez aucun cours" text="Inscrivez-vous gratuitement à un cours pour commencer." href="/explorer" cta="Explorer le catalogue" />
          )}
          {list.map((c) => (
            <div key={c.id} className="flex flex-col gap-4 rounded-xl border border-hairline p-4 sm:flex-row sm:items-center">
              <Thumb hue={c.hue} title={c.title} className="h-20 shrink-0 rounded-lg sm:w-32 [&_span]:text-xl" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-soft">{c.partner_name}</p>
                <Link href={`/cours/${c.slug}`} className="font-medium hover:text-brand-700">{c.title}</Link>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1"><ProgressBar value={(c.done / c.total) * 100} /></div>
                  <span className="text-xs font-medium text-ink-soft">{Math.round((c.done / c.total) * 100)} %</span>
                </div>
              </div>
              {c.completed_at ? (
                <Link href="/certificats" className="btn-outline">Certificat</Link>
              ) : (
                <Link href={`/cours/${c.slug}/apprendre/${c.next_item_id}`} className="btn-primary">{c.done ? "Reprendre" : "Commencer"}</Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <aside className="space-y-4 lg:pt-14">
        <div className="rounded-xl border border-hairline p-5">
          <p className="font-medium">Objectif de la semaine</p>
          <p className="mt-1 text-sm text-ink-soft">
            {goalReached ? "Objectif atteint, bravo ! 🎯" : `${activeDays.size} jour${activeDays.size > 1 ? "s" : ""} d'apprentissage sur ${user.weekly_goal}`}
          </p>
          <div className="mt-4 flex justify-between">
            {week.map((d, i) => (
              <span key={i} className={`grid size-9 place-items-center rounded-pill text-xs font-medium ${d.active ? "bg-brand-600 text-white" : "bg-surface text-ink-soft"}`}>
                {d.active ? "✓" : d.label}
              </span>
            ))}
          </div>
          <form action={setWeeklyGoal} className="mt-4 flex items-center gap-2 border-t border-hairline pt-4 text-sm">
            <label htmlFor="goal" className="text-ink-soft">Objectif :</label>
            <select id="goal" name="goal" defaultValue={user.weekly_goal} className="field w-auto py-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} jour{n > 1 ? "s" : ""}</option>)}
            </select>
            <button className="btn-ghost px-3 py-1.5">Enregistrer</button>
          </form>
        </div>
        <div className="rounded-xl border border-hairline p-5">
          <p className="font-medium">Certificats</p>
          <p className="mt-1 text-sm text-ink-soft">{certificates.length} certificat{certificates.length > 1 ? "s" : ""} obtenu{certificates.length > 1 ? "s" : ""}</p>
          <Link href="/certificats" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">Voir mes certificats →</Link>
        </div>
      </aside>
    </div>
  );
}
