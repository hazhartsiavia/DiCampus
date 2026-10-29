"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, signup } from "@/app/actions";

const EMPTY_PROFILE = { last_name: "", first_name: "", university: "", university_other: "", program: "", study_level: "" };

export function AuthForm({ mode, next, universities = [], levels = [] }: {
  mode: "login" | "signup"; next?: string; universities?: string[]; levels?: readonly string[];
}) {
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, undefined);
  // Champs contrôlés pour garder la saisie quand le serveur renvoie une erreur.
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const bind = (key: keyof typeof EMPTY_PROFILE) => ({
    name: key,
    value: profile[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setProfile((p) => ({ ...p, [key]: e.target.value })),
    required: true,
    className: "field mt-1",
  });
  const [email, setEmail] = useState("");
  const suffix = next ? `?suite=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="suite" value={next ?? ""} />
      {mode === "signup" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Nom
              <input {...bind("last_name")} autoComplete="family-name" />
            </label>
            <label className="block text-sm font-medium">
              Prénom
              <input {...bind("first_name")} autoComplete="given-name" />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Université / établissement
            <select {...bind("university")}>
              <option value="" disabled>Choisir…</option>
              {universities.map((u) => <option key={u} value={u}>{u}</option>)}
              <option value="autre">Autre établissement…</option>
            </select>
          </label>
          {profile.university === "autre" && (
            <label className="block text-sm font-medium">
              Nom de votre établissement
              <input {...bind("university_other")} placeholder="Ex. : Lycée Mixte d'Antsiranana" />
            </label>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Parcours
              <input {...bind("program")} placeholder="Ex. : Langues et Communication numérique" />
            </label>
            <label className="block text-sm font-medium">
              Niveau d&apos;études
              <select {...bind("study_level")}>
                <option value="" disabled>Choisir…</option>
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
          </div>
        </>
      )}
      <label className="block text-sm font-medium">
        Adresse e-mail
        <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="field mt-1" />
      </label>
      <label className="block text-sm font-medium">
        Mot de passe
        <input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "signup" ? 8 : undefined} className="field mt-1" />
        {mode === "signup" && <span className="mt-1 block text-xs text-ink-soft">8 caractères minimum.</span>}
      </label>
      {state?.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        {mode === "login" ? (
          <>Pas encore de compte ? <Link href={`/inscription${suffix}`} className="font-medium text-brand-700 hover:underline">Inscrivez-vous</Link></>
        ) : (
          <>Déjà inscrit ? <Link href={`/connexion${suffix}`} className="font-medium text-brand-700 hover:underline">Connectez-vous</Link></>
        )}
      </p>
    </form>
  );
}
