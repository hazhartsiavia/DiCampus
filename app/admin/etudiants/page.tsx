import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listStudents, readFilters, studentFilterOptions } from "@/lib/students";

export const metadata: Metadata = { title: "Étudiants" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

function formatDate(sqlite: string) {
  // SQLite enregistre l'heure UTC sans fuseau.
  return new Date(`${sqlite.replace(" ", "T")}Z`).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

export default async function StudentsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const filters = readFilters(params);
  const students = listStudents(filters);
  const options = studentFilterOptions();
  const query = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1])).toString();
  const filtered = Object.values(filters).some(Boolean);

  const select = (name: string, label: string, values: string[], current: string) => (
    <label className="block">
      <span className="text-sm text-ink-soft">{label}</span>
      <select name={name} defaultValue={current} className="field mt-1">
        <option value="">Tous</option>
        {values.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    </label>
  );

  return (
    <div className="container-page py-12">
      <Link href="/admin" className="text-sm text-ink-soft hover:underline">← Administration</Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Étudiants</h1>
          <p className="mt-3 text-ink-soft">{students.length} compte{students.length > 1 ? "s" : ""}{filtered ? " correspondant aux filtres" : " inscrits sur DiCampus"}</p>
        </div>
        {students.length > 0 && <a href={`/admin/etudiants/export${query ? `?${query}` : ""}`} className="btn-outline">Exporter (CSV)</a>}
      </div>

      <form className="mt-8 grid gap-4 rounded-card-lg bg-surface p-5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end">
        <label className="block">
          <span className="text-sm text-ink-soft">Recherche</span>
          <input name="q" defaultValue={filters.q} placeholder="Nom, e-mail ou parcours…" className="field mt-1" />
        </label>
        {select("universite", "Université", options.universities, filters.university)}
        {select("parcours", "Parcours", options.programs, filters.program)}
        {select("niveau", "Niveau", options.levels, filters.level)}
        <div className="flex gap-2">
          <button className="btn-primary px-5 py-3">Filtrer</button>
          {filtered && <Link href="/admin/etudiants" className="btn-ghost px-4 py-3">Effacer</Link>}
        </div>
      </form>

      {students.length === 0 ? (
        <p className="mt-6 rounded-card-lg bg-surface p-6 text-ink-soft">{filtered ? "Aucun étudiant ne correspond à ces filtres." : "Aucun compte pour le moment."}</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-card-lg border border-hairline">
          <table className="w-full min-w-[64rem] text-left">
            <thead className="bg-surface text-sm text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Étudiant</th>
                <th className="px-5 py-3 font-semibold">Université</th>
                <th className="px-5 py-3 font-semibold">Parcours</th>
                <th className="px-5 py-3 font-semibold">Niveau</th>
                <th className="px-5 py-3 font-semibold">Cours suivis</th>
                <th className="px-5 py-3 font-semibold">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {students.map((s) => (
                <tr key={s.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-bold">{s.last_name ? `${s.last_name.toUpperCase()} ${s.first_name}` : s.name}</p>
                    <p className="text-sm text-ink-soft">{s.email}</p>
                  </td>
                  <td className="px-5 py-4">{s.university ?? <span className="text-ink-soft">—</span>}</td>
                  <td className="px-5 py-4">{s.program ?? <span className="text-ink-soft">—</span>}</td>
                  <td className="whitespace-nowrap px-5 py-4">{s.study_level ?? <span className="text-ink-soft">—</span>}</td>
                  <td className="px-5 py-4">
                    {s.course_count === 0 ? <span className="text-ink-soft">Aucun</span> : (
                      <>
                        <p className="font-semibold">{s.course_count}</p>
                        <p className="text-sm text-ink-soft">{s.courses}</p>
                      </>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-ink-soft">{formatDate(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-sm text-ink-soft">Les comptes créés avant l&apos;ajout des champs université, parcours et niveau affichent « — ».</p>
    </div>
  );
}
