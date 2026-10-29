import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite } = await searchParams;
  if (await getCurrentUser()) redirect("/mon-apprentissage");
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-5xl font-bold leading-[1.1] tracking-tight">Bon retour</h1>
        <p className="mb-8 mt-2 text-center text-ink-soft">Connectez-vous pour reprendre vos cours.</p>
        <AuthForm mode="login" next={suite} />
      </div>
    </div>
  );
}
