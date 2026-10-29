"use client";

import { useActionState, useEffect, useState } from "react";
import type { FormState } from "@/app/actions";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

type SubmissionView = { text: string; link: string | null; submitted_at: string; grade: number | null; feedback: string | null } | null;

function formatDate(iso: string) {
  // SQLite renvoie l'heure UTC sans fuseau.
  return new Date(`${iso.replace(" ", "T")}Z`).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

/** Zone de rendu du TP côté élève : brouillon dans le navigateur, rendu modifiable jusqu'à la correction. */
export function TpSubmission({ itemId, action, submission }: { itemId: number; action?: Action; submission: SubmissionView }) {
  const storageKey = `dicampus-tp-${itemId}`;
  const [state, formAction, pending] = useActionState(action ?? (async () => undefined), undefined);
  const [text, setText] = useState(submission?.text ?? "");
  const [link, setLink] = useState(submission?.link ?? "");
  const graded = submission?.grade != null;

  // Brouillon local tant que rien n'a été rendu.
  useEffect(() => {
    if (submission) return;
    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) setText(draft);
    } catch {}
  }, [storageKey, submission]);
  useEffect(() => {
    if (submission) return;
    try {
      localStorage.setItem(storageKey, text);
    } catch {}
  }, [storageKey, text, submission]);

  if (graded) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-card bg-brand p-6 text-white">
          <div>
            <p className="text-xs text-white/60">TP corrigé</p>
            <p className="mt-1 text-5xl font-medium tracking-tight">{submission.grade!.toLocaleString("fr-FR")}<span className="text-2xl text-white/60">/20</span></p>
          </div>
          <p className="text-sm text-white/70">Rendu le {formatDate(submission.submitted_at)}</p>
        </div>
        {submission.feedback && (
          <div className="rounded-card border-l-4 border-teal bg-teal/[0.07] p-5">
            <p className="mb-1 text-xs font-medium text-ink-soft">Commentaire de l&apos;enseignant</p>
            <p className="whitespace-pre-line">{submission.feedback}</p>
          </div>
        )}
        <details className="rounded-card border border-hairline p-5">
          <summary className="cursor-pointer font-medium">Mon rendu</summary>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{submission.text}</p>
          {submission.link && <a href={submission.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-brand underline">{submission.link}</a>}
        </details>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-card bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight">Mon rendu</h2>
        {submission && <span className="rounded-pill bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">Rendu le {formatDate(submission.submitted_at)} · en attente de correction</span>}
      </div>
      <textarea
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        className="field bg-white leading-relaxed"
        placeholder="Rédigez votre travail ici. Votre brouillon est gardé dans ce navigateur tant que vous n'avez pas rendu."
        disabled={!action}
      />
      <label className="block">
        <span className="text-xs font-medium text-ink-soft">Lien (facultatif)</span>
        <input
          name="link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="field mt-1.5 bg-white"
          placeholder="https://… (document Google, dossier Drive avec vos captures floutées…)"
          disabled={!action}
        />
      </label>
      {state?.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state && !state.error && <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-800">TP rendu. Vous pouvez encore le modifier tant qu&apos;il n&apos;est pas corrigé.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-ink-soft">{text.trim().length.toLocaleString("fr-FR")} caractères</span>
        <button className="btn-primary" disabled={pending || !action}>{pending ? "Envoi…" : submission ? "Mettre à jour mon rendu" : "Rendre le TP"}</button>
      </div>
      {!action && <p className="text-xs text-ink-soft">Aperçu enseignant : le rendu est désactivé.</p>}
    </form>
  );
}

/** Correction d'un rendu côté enseignant. */
export function GradeForm({ action, grade, feedback }: { action: Action; grade: number | null; feedback: string | null }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [g, setG] = useState(grade === null ? "" : String(grade));
  const [f, setF] = useState(feedback ?? "");
  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-start">
      <label className="block">
        <span className="text-xs font-medium text-ink-soft">Note /20</span>
        <input name="grade" type="number" min={0} max={20} step={0.25} value={g} onChange={(e) => setG(e.target.value)} className="field mt-1 bg-white" required />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-ink-soft">Commentaire</span>
        <textarea name="feedback" rows={2} value={f} onChange={(e) => setF(e.target.value)} className="field mt-1 bg-white" placeholder="Points forts, points à améliorer…" />
      </label>
      <div className="sm:pt-5">
        <button className="btn-primary w-full" disabled={pending}>{pending ? "…" : grade === null ? "Noter" : "Modifier"}</button>
        {state?.error && <p className="mt-2 text-xs text-red-700">{state.error}</p>}
        {state && !state.error && <p className="mt-2 text-xs text-brand-800">Enregistré.</p>}
      </div>
    </form>
  );
}
