import Link from "next/link";
import { CourseGrid, EmptyState } from "@/components/ui";
import { listDomains, listPartners, searchCourses, type CourseFilters } from "@/lib/queries";
import { LEVELS as SEED_LEVELS } from "@/lib/seed-data";

const LEVELS = SEED_LEVELS;
const SORTS = [
  ["", "Les plus suivis"],
  ["note", "Les mieux notés"],
  ["duree", "Les plus courts"],
  ["recent", "Les plus récents"],
];

type Params = { q?: string; domaine?: string; niveau?: string; partenaire?: string; tri?: string };

function hrefWith(base: string, params: Params, key: keyof Params, value: string | undefined) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, [key]: value })) if (v) next.set(k, v);
  const qs = next.toString();
  return qs ? `${base}?${qs}` : base;
}

function FilterGroup({ title, options, current, base, params, param }: {
  title: string;
  options: [string, string][];
  current?: string;
  base: string;
  params: Params;
  param: keyof Params;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {options.map(([value, label]) => {
          const active = (current ?? "") === value;
          return (
            <li key={value}>
              <Link
                href={hrefWith(base, params, param, active ? undefined : value || undefined)}
                className={`flex items-center gap-2 rounded-md px-2 py-1 ${active ? "bg-brand-50 font-medium text-brand-800" : "text-ink-soft hover:bg-surface"}`}
              >
                <span className={`grid size-4 place-items-center rounded border text-[10px] ${active ? "border-brand-700 bg-brand-700 text-white" : "border-ghost"}`}>{active ? "✓" : ""}</span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Catalog({ base, params, lockedDomain }: { base: string; params: Params; lockedDomain?: string }) {
  const filters: CourseFilters = {
    q: params.q,
    domain: lockedDomain ?? params.domaine,
    level: params.niveau,
    partner: params.partenaire,
    sort: params.tri,
  };
  const results = searchCourses(filters);
  const domains = listDomains();
  const partners = listPartners();

  return (
    <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        {!lockedDomain && (
          <FilterGroup title="Domaine" param="domaine" base={base} params={params} current={params.domaine} options={domains.map((d) => [d.slug, d.name])} />
        )}
        <FilterGroup title="Niveau" param="niveau" base={base} params={params} current={params.niveau} options={LEVELS.map((l) => [l, l])} />
        <FilterGroup title="Établissement" param="partenaire" base={base} params={params} current={params.partenaire} options={partners.map((p) => [p.slug, p.name])} />
      </aside>
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">{results.length}</strong> résultat{results.length > 1 ? "s" : ""}
            {params.q ? <> pour « {params.q} »</> : null}
          </p>
          <div className="flex flex-wrap gap-2">
            {SORTS.map(([value, label]) => (
              <Link
                key={value}
                href={hrefWith(base, params, "tri", value || undefined)}
                className={`rounded-pill border px-3 py-1 text-xs font-medium ${(params.tri ?? "") === value ? "border-brand-700 bg-brand-700 text-white" : "border-hairline hover:border-brand-600"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        {results.length ? (
          <div className="[&>div]:xl:grid-cols-3">
            <CourseGrid courses={results} />
          </div>
        ) : (
          <EmptyState title="Aucun cours trouvé" text="Essayez un autre mot-clé ou retirez certains filtres." href={base} cta="Réinitialiser les filtres" />
        )}
      </div>
    </div>
  );
}

export type { Params as CatalogParams };
