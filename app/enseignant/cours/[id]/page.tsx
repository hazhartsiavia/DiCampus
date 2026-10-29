import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addItem, addModule, deleteCourse, deleteItem, deleteModule, moveItem, moveModule, saveCourse, setCourseStatus, updateModule,
} from "../../actions";
import { CourseForm } from "@/components/teacher-forms";
import { itemIcon, itemLabel } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { getExamForCourse } from "@/lib/exams";
import { firstItemId, getModules } from "@/lib/queries";
import { LEVELS } from "@/lib/seed-data";
import { getEditableCourse, listDomainOptions, listEstablishmentOptions } from "@/lib/teaching";
import { listTpItems } from "@/lib/tp";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string }> };

export const metadata: Metadata = { title: "Modifier le cours" };

const ERRORS: Record<string, string> = {
  vide: "Ajoutez au moins un élément avant de publier le cours.",
  inscrits: "Ce cours a des inscrits : dépubliez-le plutôt que de le supprimer.",
};

const KINDS = ["reading", "video", "quiz", "cards", "match", "reflection", "tp"] as const;

function IconButton({ action, label, children, danger = false }: { action: () => Promise<void>; label: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <form action={action}>
      <button
        className={`grid size-8 place-items-center rounded-pill text-sm transition-colors ${danger ? "text-ink-soft hover:bg-red-50 hover:text-red-700" : "text-ink-soft hover:bg-white hover:text-ink"}`}
        aria-label={label}
        title={label}
      >
        {children}
      </button>
    </form>
  );
}

export default async function EditCoursePage({ params, searchParams }: Props) {
  const user = await requireTeacher();
  const course = getEditableCourse(Number((await params).id), user);
  if (!course) notFound();
  const { erreur } = await searchParams;
  const modules = getModules(course.id);
  const exam = getExamForCourse(course.id);
  const first = firstItemId(course.id);
  const published = course.status === "published";
  const tps = listTpItems(course.id);
  const toGrade = tps.reduce((n, t) => n + t.to_grade, 0);

  return (
    <div className="container-page py-12">
      <Link href="/enseignant" className="text-sm text-ink-soft hover:underline">← Mes cours</Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <span className={`rounded-pill px-3 py-1 text-xs font-medium ${published ? "bg-brand-50 text-brand-800" : "bg-amber-100 text-amber-900"}`}>
            {published ? "Publié" : "Brouillon"}
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{course.title}</h1>
          <p className="mt-2 text-sm text-ink-soft">{course.learners} inscrit{course.learners > 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {first && <Link href={`/cours/${course.slug}/apprendre/${first}`} className="btn-ghost">Aperçu</Link>}
          {published && <Link href={`/cours/${course.slug}`} className="btn-ghost">Page publique</Link>}
          {tps.length > 0 && (
            <Link href={`/enseignant/cours/${course.id}/tp`} className="btn-outline">
              Travaux pratiques{toGrade > 0 && <span className="ml-2 rounded-pill bg-accent px-2 py-0.5 text-xs text-ink">{toGrade} à corriger</span>}
            </Link>
          )}
          {exam && <Link href={`/enseignant/cours/${course.id}/examen`} className="btn-outline">Notes de l&apos;examen</Link>}
          <form action={setCourseStatus.bind(null, course.id, published ? "draft" : "published")}>
            <button className="btn-primary">{published ? "Dépublier" : "Publier"}</button>
          </form>
        </div>
      </div>
      {erreur && ERRORS[erreur] && <p className="mt-6 rounded-card bg-amber-50 p-4 text-sm text-amber-900">{ERRORS[erreur]}</p>}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_26rem]">
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Contenu</h2>
          <ol className="mt-5 space-y-4">
            {modules.map((m, mi) => (
              <li key={m.id} className="rounded-card bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start gap-3">
                  <form action={updateModule.bind(null, m.id)} className="flex min-w-0 flex-1 flex-wrap gap-2">
                    <input name="title" defaultValue={m.title} className="field min-w-0 flex-1 font-medium" aria-label="Titre du module" />
                    <input name="summary" defaultValue={m.summary} placeholder="Résumé (facultatif)" className="field min-w-0 flex-[2]" aria-label="Résumé du module" />
                    <button className="btn-ghost px-4">Renommer</button>
                  </form>
                  <div className="flex items-center">
                    {mi > 0 && <IconButton action={moveModule.bind(null, m.id, -1)} label="Monter le module">↑</IconButton>}
                    {mi < modules.length - 1 && <IconButton action={moveModule.bind(null, m.id, 1)} label="Descendre le module">↓</IconButton>}
                    <IconButton action={deleteModule.bind(null, m.id)} label="Supprimer le module et ses éléments" danger>✕</IconButton>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {m.items.map((it, ii) => (
                    <li key={it.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface text-xs">{itemIcon(it.kind)}</span>
                      <Link href={`/enseignant/cours/${course.id}/elements/${it.id}`} className="min-w-0 flex-1 truncate text-sm hover:text-brand hover:underline">{it.title}</Link>
                      <span className="hidden text-xs text-ink-soft sm:inline">{itemLabel(it.kind)} · {it.minutes} min</span>
                      {ii > 0 && <IconButton action={moveItem.bind(null, it.id, -1)} label="Monter">↑</IconButton>}
                      {ii < m.items.length - 1 && <IconButton action={moveItem.bind(null, it.id, 1)} label="Descendre">↓</IconButton>}
                      <IconButton action={deleteItem.bind(null, it.id)} label="Supprimer l'élément" danger>✕</IconButton>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  {KINDS.map((k) => (
                    <form key={k} action={addItem.bind(null, m.id, k)}>
                      <button className="rounded-pill border border-hairline bg-white px-3 py-1.5 text-xs font-medium hover:border-ink">+ {itemLabel(k)}</button>
                    </form>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <form action={addModule.bind(null, course.id)} className="mt-4 flex gap-2">
            <input name="title" placeholder="Titre du nouveau module" className="field" />
            <button className="btn-outline shrink-0">Ajouter un module</button>
          </form>
        </section>

        <aside>
          <h2 className="text-2xl font-bold tracking-tight">Fiche du cours</h2>
          <div className="mt-5 rounded-card border border-hairline p-5">
            <CourseForm
              action={saveCourse.bind(null, course.id)}
              values={{
                title: course.title, subtitle: course.subtitle, description: course.description, domain_id: course.domain_id,
                partner_id: course.partner_id, level: course.level, hours: course.hours,
                outcomes: course.outcomes.join("\n"), skills: course.skills.join(", "),
              }}
              domains={listDomainOptions()}
              establishments={listEstablishmentOptions()}
              levels={LEVELS}
              submitLabel="Enregistrer la fiche"
            />
          </div>
          {course.learners === 0 && (
            <form action={deleteCourse.bind(null, course.id)} className="mt-6">
              <button className="text-sm text-red-700 hover:underline">Supprimer définitivement ce cours</button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
