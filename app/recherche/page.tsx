import type { Metadata } from "next";
import { Catalog, type CatalogParams } from "@/components/catalog";

export const metadata: Metadata = { title: "Recherche" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  const params = await searchParams;
  return (
    <div className="container-page py-10">
      <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">{params.q ? `Résultats pour « ${params.q} »` : "Rechercher un cours"}</h1>
      <form action="/recherche" className="mt-5 flex max-w-xl gap-2">
        <input name="q" defaultValue={params.q} type="search" placeholder="Compétence, sujet, outil…" className="field" aria-label="Rechercher" />
        <button className="btn-primary">Rechercher</button>
      </form>
      <div className="mt-8">
        <Catalog base="/recherche" params={params} />
      </div>
    </div>
  );
}
