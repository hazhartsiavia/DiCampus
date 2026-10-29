import type { Metadata } from "next";
import Link from "next/link";
import { saveCourse } from "../../actions";
import { CourseForm } from "@/components/teacher-forms";
import { requireTeacher } from "@/lib/auth";
import { LEVELS } from "@/lib/seed-data";
import { listDomainOptions, listEstablishmentOptions } from "@/lib/teaching";

export const metadata: Metadata = { title: "Nouveau cours" };

export default async function NewCoursePage() {
  await requireTeacher();
  return (
    <div className="container-page max-w-3xl py-12">
      <Link href="/enseignant" className="text-sm text-ink-soft hover:underline">← Mes cours</Link>
      <h1 className="mt-6 text-5xl font-bold leading-[1.1] tracking-tight">Nouveau cours</h1>
      <p className="mt-3 text-ink-soft">Le cours reste en brouillon, invisible pour les élèves, jusqu&apos;à ce que vous le publiiez.</p>
      <div className="mt-10">
        <CourseForm
          action={saveCourse.bind(null, null)}
          values={{ title: "", subtitle: "", description: "", domain_id: "", partner_id: "", level: "", hours: "", outcomes: "", skills: "" }}
          domains={listDomainOptions()}
          establishments={listEstablishmentOptions()}
          levels={LEVELS}
          submitLabel="Créer le cours"
        />
      </div>
    </div>
  );
}
