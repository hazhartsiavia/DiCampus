"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions";
import type { QuizQuestion } from "@/lib/db";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;
type Option = { id: number; name: string };

function Feedback({ state, success }: { state: FormState; success: string }) {
  if (state?.error) return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>;
  if (state) return <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{success}</p>;
  return null;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

// ---------- Demande d'accès ----------

export function RequestForm({ action, establishments }: { action: Action; establishments: Option[] }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [message, setMessage] = useState("");
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Établissement">
        <select name="partner" required className="field" defaultValue="">
          <option value="" disabled>Choisir…</option>
          {establishments.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </Field>
      <Field label="Présentation" hint="Votre fonction, les enseignements que vous assurez et les cours que vous souhaitez publier.">
        <textarea name="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="field" required />
      </Field>
      <Feedback state={state} success="Demande envoyée : un administrateur va l'examiner." />
      <button className="btn-primary" disabled={pending}>{pending ? "Envoi…" : "Demander l'accès enseignant"}</button>
    </form>
  );
}

// ---------- Fiche du cours ----------

export type CourseValues = {
  title: string; subtitle: string; description: string; domain_id: number | ""; partner_id: number | ""; level: string;
  hours: number | ""; outcomes: string; skills: string;
};

export function CourseForm({ action, values, domains, establishments, levels, submitLabel }: {
  action: Action; values: CourseValues; domains: Option[]; establishments: Option[]; levels: readonly string[]; submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // Champs contrôlés : React vide les champs non contrôlés après chaque envoi, même refusé.
  const [v, setV] = useState(values);
  const bind = (key: keyof CourseValues) => ({
    name: key === "domain_id" ? "domain" : key === "partner_id" ? "partner" : key,
    value: v[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV((s) => ({ ...s, [key]: e.target.value })),
  });

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Titre"><input {...bind("title")} className="field" required /></Field>
      <Field label="Sous-titre" hint="Une phrase qui résume ce que l'étudiant va apprendre."><input {...bind("subtitle")} className="field" required /></Field>
      <Field label="Description"><textarea {...bind("description")} rows={4} className="field" required /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Domaine">
          <select {...bind("domain_id")} className="field" required>
            <option value="" disabled>Choisir…</option>
            {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Établissement">
          <select {...bind("partner_id")} className="field" required>
            <option value="" disabled>Choisir…</option>
            {establishments.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </Field>
        <Field label="Niveau">
          <select {...bind("level")} className="field" required>
            <option value="" disabled>Choisir…</option>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Durée (heures)"><input {...bind("hours")} type="number" min={1} max={500} className="field" required /></Field>
      </div>
      <Field label="Objectifs" hint="Un objectif par ligne : ce que l'étudiant saura faire à la fin."><textarea {...bind("outcomes")} rows={4} className="field" required /></Field>
      <Field label="Compétences" hint="Séparées par des virgules."><input {...bind("skills")} className="field" required /></Field>
      <Feedback state={state} success="Cours enregistré." />
      <button className="btn-primary" disabled={pending}>{pending ? "Enregistrement…" : submitLabel}</button>
    </form>
  );
}

// ---------- Éléments ----------

const LINE_HELP: Record<string, { label: string; hint: string; placeholder: string }> = {
  cards: { label: "Cartes", hint: "Une carte par ligne : « notion :: définition ».", placeholder: "Ethos numérique :: image de soi projetée en ligne" },
  match: { label: "Paires à associer", hint: "Une paire par ligne : « élément :: correspondance ». Les correspondances sont mélangées pour l'élève.", placeholder: "Habermas :: Agir communicationnel" },
  reflection: { label: "Questions", hint: "Une question par ligne, suivie si vous le souhaitez de « :: piste de réponse ».", placeholder: "Qu'est-ce qu'un lien faible ? :: Une relation distante qui relie des réseaux différents." },
};

export type ItemValues = { kind: string; title: string; minutes: number; content: string; video_url: string | null };

function toLines(kind: string, content: string) {
  try {
    const data = JSON.parse(content);
    if (kind === "cards") return (data as { term: string; definition: string }[]).map((c) => `${c.term} :: ${c.definition}`).join("\n");
    if (kind === "match") return (data.pairs as { left: string; right: string }[]).map((p) => `${p.left} :: ${p.right}`).join("\n");
    if (kind === "reflection") return (data as { question: string; hint: string }[]).map((q) => (q.hint ? `${q.question} :: ${q.hint}` : q.question)).join("\n");
  } catch {}
  return "";
}

export function ItemForm({ action, item }: { action: Action; item: ItemValues }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [title, setTitle] = useState(item.title);
  const [minutes, setMinutes] = useState(String(item.minutes));
  const [videoUrl, setVideoUrl] = useState(item.video_url ?? "");
  const [text, setText] = useState(LINE_HELP[item.kind] ? toLines(item.kind, item.content) : item.kind === "quiz" ? "" : item.content);
  const [instruction, setInstruction] = useState(() => {
    try {
      return item.kind === "match" ? JSON.parse(item.content).instruction ?? "" : "";
    } catch {
      return "";
    }
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    try {
      return item.kind === "quiz" ? JSON.parse(item.content) : [];
    } catch {
      return [];
    }
  });

  const updateQ = (i: number, patch: Partial<QuizQuestion>) => setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
        <Field label="Titre"><input name="title" value={title} onChange={(e) => setTitle(e.target.value)} className="field" required /></Field>
        <Field label="Durée (min)"><input name="minutes" type="number" min={1} max={240} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="field" required /></Field>
      </div>

      {item.kind === "video" && (
        <Field label="Lien de la vidéo" hint="Lien YouTube, ou fichier .mp4 / .webm hébergé en https.">
          <input name="video_url" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="field" placeholder="https://www.youtube.com/watch?v=…" />
        </Field>
      )}

      {(item.kind === "video" || item.kind === "reading" || item.kind === "tp") && (
        <Field
          label={item.kind === "video" ? "Transcription" : item.kind === "tp" ? "Consigne du TP (les élèves rendent leur travail sous la consigne, vous le notez sur 20)" : "Contenu"}
          hint="Mise en forme : ## titre, ### sous-titre, - liste, > citation, **gras**, *italique*, | tableau |, et les encadrés :::cas, :::def, :::retenir … ::: (une ligne ::: pour fermer)."
        >
          <textarea name="content" rows={18} value={text} onChange={(e) => setText(e.target.value)} className="field font-mono text-[0.8rem]" />
        </Field>
      )}

      {LINE_HELP[item.kind] && (
        <>
          {item.kind === "match" && (
            <Field label="Consigne"><input name="instruction" value={instruction} onChange={(e) => setInstruction(e.target.value)} className="field" /></Field>
          )}
          <Field label={LINE_HELP[item.kind].label} hint={LINE_HELP[item.kind].hint}>
            <textarea name="content" rows={12} value={text} onChange={(e) => setText(e.target.value)} className="field" placeholder={LINE_HELP[item.kind].placeholder} />
          </Field>
        </>
      )}

      {item.kind === "quiz" && (
        <div className="space-y-4">
          <input type="hidden" name="content" value={JSON.stringify(questions)} />
          {questions.map((q, i) => (
            <fieldset key={i} className="space-y-3 rounded-card bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <legend className="text-sm font-medium">Question {i + 1}</legend>
                <button type="button" onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))} className="text-sm text-red-700 hover:underline">Supprimer</button>
              </div>
              <input value={q.question} onChange={(e) => updateQ(i, { question: e.target.value })} className="field" placeholder="Intitulé de la question" />
              {q.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-3">
                  <input type="radio" name={`answer-${i}`} checked={q.answer === oi} onChange={() => updateQ(i, { answer: oi })} className="accent-brand" aria-label={`Bonne réponse : option ${oi + 1}`} />
                  <input value={o} onChange={(e) => updateQ(i, { options: q.options.map((x, k) => (k === oi ? e.target.value : x)) })} className="field" placeholder={`Réponse ${oi + 1}`} />
                  {q.options.length > 2 && (
                    <button type="button" onClick={() => updateQ(i, { options: q.options.filter((_, k) => k !== oi), answer: q.answer === oi ? 0 : q.answer > oi ? q.answer - 1 : q.answer })} className="text-ink-soft hover:text-red-700" aria-label="Retirer cette réponse">×</button>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => updateQ(i, { options: [...q.options, ""] })} className="text-sm text-brand hover:underline">+ Ajouter une réponse</button>
                <span className="text-xs text-ink-soft">Cochez la bonne réponse.</span>
              </div>
            </fieldset>
          ))}
          <button type="button" onClick={() => setQuestions((qs) => [...qs, { question: "", options: ["", "", ""], answer: 0 }])} className="btn-outline">+ Ajouter une question</button>
        </div>
      )}

      <Feedback state={state} success="Élément enregistré." />
      <button className="btn-primary" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
    </form>
  );
}
