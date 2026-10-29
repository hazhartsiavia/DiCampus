import type { Metadata } from "next";
import { Catalog, type CatalogParams } from "@/components/catalog";

export const metadata: Metadata = { title: "Explorer le catalogue" };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  const params = await searchParams;
  return (
    <div className="container-page py-10">
      <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Explorer le catalogue</h1>
      <p className="mt-2 text-ink-soft">Tous les cours et formations de DiCampus, filtrables par domaine, niveau et établissement.</p>
      <div className="mt-8">
        <Catalog base="/explorer" params={params} />
      </div>
    </div>
  );
}
