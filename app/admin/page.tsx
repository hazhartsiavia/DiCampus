import type { Metadata } from "next";
import Link from "next/link";
import { resetExamAttempt, setCourseStatus, setExamOpen } from "@/app/enseignant/actions";
import { profileLine } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { adminStats, listAdminAttempts, listAdminCourses } from "@/lib/admin";
import { STATUS_LABELS } from "@/lib/exams";

export const metadata: Metadata = { title: "Administration" };

type Props = { searchParams: Promise<{ q?: string }> };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export default async function AdminPage({ searchParams }: Props) {
  await requireAdmin();
  const q = ((await searchParams).q ?? "").trim();
  const stats = adminStats();
  const courses = listAdminCourses();
  const attempts = listAdminAttempts(q);

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Tableau de bord</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/enseignants" className="btn-outline">
            Demandes enseignant{stats.pending_requests > 0 && <span className="rounded-pill bg-salmon px-2 py-0.5 text-xs text-ink">{stats.pending_requests}</span>}
          </Link>
          <Link href="/admin/etudiants" className="btn-outline">Étudiants</Link>
          <Link href="/enseignant/cours/nouveau" className="btn-primary">Nouveau cours</Link>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Cours publiés", stats.published, "bg-brand-50", null],
          ["Brouillons", stats.drafts, "bg-sun-50", null],
          ["Examens ouverts", stats.open_exams, "bg-mint-50", null],
          ["Élèves inscrits", stats.learners, "bg-salmon-50", "/admin/etudiants"],
        ].map(([label, value, tint, href]) => {
          const body = (
            <>
              <p className="text-ink-soft">{label}</p>
              <p className="mt-2 text-4xl font-bold tracking-tight">{value}</p>
              {href && <p className="mt-2 text-sm font-semibold text-brand">Voir la liste →</p>}
            </>
          );
          return href ? (
            <Link key={label} href={href as string} className={`hover-lift rounded-card-lg p-6 ${tint}`}>{body}</Link>
          ) : (
            <div key={label} className={`rounded-card-lg p-6 ${tint}`}>{body}</div>
          );
        })}
      </div>

      {/* ---------- Cours ---------- */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold tracking-tight">Cours et examens</h2>
        <p className="mt-2 text-ink-soft">
          Publiez ou retirez un cours, et ouvrez l&apos;examen le jour de l&apos;épreuve. Fermer un examen empêche de le commencer ; une copie déjà commencée peut être terminée.
        </p>
        <div className="mt-6 overflow-x-auto rounded-card-lg border border-hairline">
          <table className="w-full min-w-[60rem] text-left">
            <thead className="bg-surface text-sm text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Cours</th>
                <th className="px-5 py-3 font-semibold">Publication</th>
                <th className="px-5 py-3 font-semibold">Inscrits</th>
                <th className="px-5 py-3 font-semibold">Examen</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {courses.map((c) => {
                const published = c.status === "published";
                return (
                  <tr key={c.id} className="align-middle">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-[0.65rem] font-bold text-brand">{c.partner_short}</span>
                        <div className="min-w-0">
                          <p className="font-bold">{c.title}</p>
                          <p className="text-sm text-ink-soft">{c.level} · {c.items} éléments{c.owner_name ? ` · ${c.owner_name}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <form action={setCourseStatus.bind(null, c.id, published ? "draft" : "published")} className="flex items-center gap-3">
                        <span className={`rounded-pill px-3 py-1 text-sm font-semibold ${published ? "bg-brand-50 text-brand" : "bg-amber-100 text-amber-900"}`}>
                          {published ? "Publié" : "Brouillon"}
                        </span>
                        <button className="text-sm font-semibold text-ink-soft hover:text-brand hover:underline">{published ? "Dépublier" : "Publier"}</button>
                      </form>
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {c.learners > 0 ? <Link href={`/enseignant/cours/${c.id}/etudiants`} className="text-brand hover:underline">{c.learners}</Link> : 0}
                    </td>
                    <td className="px-5 py-4">
                      {c.exam_id ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <form action={setExamOpen.bind(null, c.id, !c.exam_open)}>
                            <button
                              className={`inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-sm font-bold transition-colors ${c.exam_open ? "bg-mint text-ink hover:bg-ink hover:text-white" : "bg-surface text-ink-soft hover:bg-ink hover:text-white"}`}
                              title={c.exam_open ? "Cliquer pour fermer l'examen" : "Cliquer pour ouvrir l'examen"}
                            >
                              <span className={`size-2 rounded-pill ${c.exam_open ? "bg-teal" : "bg-ink-soft"}`} />
                              {c.exam_open ? "Ouvert" : "Fermé"}
                            </button>
                          </form>
                          <Link href={`/enseignant/cours/${c.id}/examen`} className="text-sm text-brand hover:underline">
                            {c.attempts} copie{c.attempts > 1 ? "s" : ""}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-sm text-ink-soft">Pas d&apos;examen</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/enseignant/cours/${c.id}`} className="btn-ghost border border-hairline px-4 py-2">Modifier</Link>
                        {published && <Link href={`/cours/${c.slug}`} className="btn-ghost px-4 py-2">Voir</Link>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Copies d'examen ---------- */}
      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Copies d&apos;examen</h2>
            <p className="mt-2 text-ink-soft">« Autoriser à repasser » supprime la copie et sa note : l&apos;élève pourra recommencer l&apos;examen s&apos;il est ouvert.</p>
          </div>
          <form className="flex w-full max-w-sm items-center gap-2 rounded-pill border border-hairline py-1.5 pl-5 pr-1.5 sm:w-auto" role="search">
            <input name="q" defaultValue={q} placeholder="Élève, e-mail ou cours…" className="w-full bg-transparent outline-none sm:w-60" aria-label="Rechercher une copie" />
            <button className="btn-primary px-4 py-2 text-sm">Rechercher</button>
          </form>
        </div>
        {attempts.length === 0 ? (
          <p className="mt-6 rounded-card-lg bg-surface p-6 text-ink-soft">{q ? `Aucune copie pour « ${q} ».` : "Aucun élève n'a encore passé d'examen."}</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-card-lg border border-hairline">
            <table className="w-full min-w-[52rem] text-left">
              <thead className="bg-surface text-sm text-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-semibold">Élève</th>
                  <th className="px-5 py-3 font-semibold">Cours</th>
                  <th className="px-5 py-3 font-semibold">Note</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 font-semibold">Début</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-4">
                      <p className="font-bold">{a.user_name}</p>
                      <p className="text-sm text-ink-soft">{a.user_email}</p>
                      {profileLine(a) && <p className="text-sm text-ink-soft">{profileLine(a)}</p>}
                    </td>
                    <td className="px-5 py-4">{a.course_title}</td>
                    <td className="px-5 py-4 text-lg font-bold">{a.score === null ? "—" : `${a.score.toLocaleString("fr-FR")}/20`}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-pill px-3 py-1 text-sm font-semibold ${
                        a.status === "terminated" ? "bg-red-50 text-red-800" : a.status === "in_progress" ? "bg-amber-100 text-amber-900" : "bg-brand-50 text-brand"
                      }`}>
                        {STATUS_LABELS[a.status]}
                      </span>
                      {a.switches > 0 && <span className="ml-2 text-sm text-red-700">{a.switches}/{a.max_switches} onglets</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-soft">{formatDate(a.started_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <form action={resetExamAttempt.bind(null, a.course_id, a.id)}>
                        <button className="btn-ghost border border-hairline px-4 py-2 hover:border-brand hover:text-brand">Autoriser à repasser</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
