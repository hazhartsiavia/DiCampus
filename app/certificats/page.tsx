import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, Thumb } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { myCertificates } from "@/lib/queries";

export const metadata: Metadata = { title: "Mes certificats" };

export default async function CertificatesPage() {
  const user = await requireUser("/certificats");
  const certificates = myCertificates(user.id);
  return (
    <div className="container-page py-10">
      <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Mes certificats</h1>
      <div className="mt-8">
        {certificates.length === 0 ? (
          <EmptyState title="Pas encore de certificat" text="Terminez tous les éléments d'un cours pour recevoir un certificat vérifiable." href="/mon-apprentissage" cta="Reprendre mes cours" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((c) => (
              <Link key={c.code} href={`/certificats/${c.code}`} className="overflow-hidden rounded-xl border border-hairline transition hover:shadow-lg">
                <Thumb hue={c.hue} title={c.course_title} className="h-28" />
                <div className="p-4">
                  <p className="font-medium">{c.course_title}</p>
                  <p className="text-sm text-ink-soft">{c.partner_name}</p>
                  <p className="mt-2 text-xs text-ink-soft">Obtenu le {new Date(c.completed_at + "Z").toLocaleDateString("fr-FR")}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
