import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Catalog, type CatalogParams } from "@/components/catalog";
import { getDomain } from "@/lib/queries";

type Props = { params: Promise<{ domaine: string }>; searchParams: Promise<CatalogParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const domain = getDomain((await params).domaine);
  return { title: domain?.name ?? "Domaine" };
}

export default async function DomainPage({ params, searchParams }: Props) {
  const { domaine } = await params;
  const domain = getDomain(domaine);
  if (!domain) notFound();
  return (
    <>
      <section className="bg-surface">
        <div className="container-page py-10">
          <nav className="text-sm text-ink-soft"><Link href="/explorer" className="hover:underline">Explorer</Link> / {domain.name}</nav>
          <div className="mt-4 flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-card bg-brand text-xl font-bold text-white">{domain.icon}</span>
            <div>
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">{domain.name}</h1>
              <p className="text-ink-soft">{domain.description}</p>
            </div>
          </div>
        </div>
      </section>
      <div className="container-page py-10">
        <Catalog base={`/explorer/${domain.slug}`} params={await searchParams} lockedDomain={domain.slug} />
      </div>
    </>
  );
}
