import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Thumb } from "@/components/ui";
import { getSpecialization } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const spec = getSpecialization((await params).slug);
  return { title: spec ? `Parcours ${spec.title}` : "Parcours" };
}

export default async function SpecializationPage({ params }: Props) {
  const spec = getSpecialization((await params).slug);
  if (!spec) notFound();
  return (
    <>
      <section className="bg-brand text-white">
        <div className="container-page py-14">
          <p className="text-sm font-medium text-white/75">Parcours métier · {spec.domain_name}</p>
          <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">{spec.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">{spec.description}</p>
          <p className="mt-6 text-sm">{spec.course_count} cours · {spec.hours} heures au total · {spec.partner_name}</p>
        </div>
      </section>
      <div className="container-page max-w-4xl py-12">
        <h2 className="text-2xl font-bold">Les cours du parcours</h2>
        <p className="mt-1 text-ink-soft">Suivez-les dans l&apos;ordre : chaque cours s&apos;appuie sur le précédent.</p>
        <ol className="mt-6 space-y-4">
          {spec.courses.map((c, i) => (
            <li key={c.id}>
              <Link href={`/cours/${c.slug}`} className="flex flex-col gap-4 rounded-xl border border-hairline p-4 transition hover:shadow-md sm:flex-row sm:items-center">
                <Thumb hue={c.hue} title={c.title} className="h-24 shrink-0 rounded-lg sm:w-40" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-brand-700">Cours {i + 1}</p>
                  <h3 className="text-lg font-bold">{c.title}</h3>
                  <p className="text-sm text-ink-soft">{c.subtitle}</p>
                  <p className="mt-1 text-xs text-ink-soft">{c.level} · {c.hours} h · {c.partner_name}</p>
                </div>
                <span className="text-sm font-medium text-brand-700">Voir →</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
