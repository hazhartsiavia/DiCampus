import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { STUDY_LEVELS } from "@/lib/seed-data";
import { listEstablishmentOptions } from "@/lib/teaching";

export const metadata: Metadata = { title: "Inscription" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite } = await searchParams;
  if (await getCurrentUser()) redirect("/mon-apprentissage");
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-xl">
        <h1 className="text-center text-5xl font-bold leading-[1.1] tracking-tight">Créez votre compte</h1>
        <p className="mb-8 mt-2 text-center text-ink-soft">Gratuit, et prêt en moins d&apos;une minute.</p>
        <AuthForm
          mode="signup"
          next={suite}
          universities={listEstablishmentOptions().filter((e) => e.slug !== "dicampus").map((e) => e.name)}
          levels={STUDY_LEVELS}
        />
      </div>
    </div>
  );
}
