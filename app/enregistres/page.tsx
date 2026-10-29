import type { Metadata } from "next";
import { CourseGrid, EmptyState } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { savedCourses } from "@/lib/queries";

export const metadata: Metadata = { title: "Cours enregistrés" };

export default async function SavedPage() {
  const user = await requireUser("/enregistres");
  const courses = savedCourses(user.id);
  return (
    <div className="container-page py-10">
      <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Cours enregistrés</h1>
      <div className="mt-8">
        {courses.length ? <CourseGrid courses={courses} /> : (
          <EmptyState title="Aucun cours enregistré" text="Enregistrez des cours depuis leur page pour les retrouver ici." href="/explorer" cta="Explorer le catalogue" />
        )}
      </div>
    </div>
  );
}
