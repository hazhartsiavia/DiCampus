import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/header";
import { PrintButton } from "@/components/print-button";
import { getCertificate } from "@/lib/queries";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cert = getCertificate((await params).code);
  return { title: cert ? `Certificat · ${cert.course_title}` : "Certificat" };
}

export default async function CertificatePage({ params }: Props) {
  const { code } = await params;
  const cert = getCertificate(code);
  if (!cert) notFound();
  const date = new Date(cert.completed_at + "Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="relative overflow-hidden rounded-card border-8 border-brand-700 bg-white p-8 sm:p-14">
        <div className="absolute -right-20 -top-20 size-64 rounded-pill bg-brand-50" aria-hidden />
        <div className="relative">
          <Logo />
          <p className="mt-10 text-sm font-medium text-brand-700">Certificat de réussite</p>
          <p className="mt-6 text-ink-soft">Ce certificat atteste que</p>
          <p className="mt-2 text-4xl font-medium tracking-tight">{cert.learner}</p>
          <p className="mt-6 text-ink-soft">a terminé avec succès le cours</p>
          <p className="mt-2 text-2xl font-medium text-brand-800">{cert.course_title}</p>
          <p className="mt-2 text-sm text-ink-soft">proposé par {cert.partner_name} · environ {cert.hours} heures</p>
          <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-hairline pt-6 text-sm">
            <div>
              <p className="font-medium">{cert.instructor_name}</p>
              <p className="text-ink-soft">Équipe pédagogique</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{date}</p>
              <p className="text-ink-soft">Code de vérification : <span className="font-mono">{cert.code}</span></p>
            </div>
          </div>
        </div>
      </div>
      <div className="no-print mt-6 flex justify-center gap-3">
        <PrintButton />
      </div>
    </div>
  );
}
