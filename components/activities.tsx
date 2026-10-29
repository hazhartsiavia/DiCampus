"use client";

import { useEffect, useMemo, useState } from "react";
import { inlineMd } from "@/components/rich-text";

type CompleteProps = { completeAction?: () => Promise<void>; alreadyDone: boolean };

function CompleteButton({ completeAction, alreadyDone, ready, label = "Valider et continuer" }: CompleteProps & { ready: boolean; label?: string }) {
  if (alreadyDone) return <p className="text-sm font-medium text-brand">✓ Activité terminée</p>;
  if (!completeAction) return <p className="text-sm text-ink-soft">Mode aperçu : la progression n&apos;est pas enregistrée.</p>;
  return (
    <form action={completeAction}>
      <button className="btn-primary" disabled={!ready}>{label}</button>
    </form>
  );
}

// ---------- Glossaire : cartes à retourner ----------

export function FlashCards({ cards, ...complete }: { cards: { term: string; definition: string }[] } & CompleteProps) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setFlipped((s) => {
    const next = new Set(s);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    return next;
  });
  const [seen, setSeen] = useState<Set<number>>(new Set());
  useEffect(() => setSeen((s) => new Set([...s, ...flipped])), [flipped]);

  return (
    <div className="space-y-6">
      <p className="rounded-card bg-brand-50 p-4 text-sm">
        Essayez de définir chaque notion avant de retourner la carte. {seen.size}/{cards.length} cartes consultées.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="group h-44 text-left [perspective:1000px]"
            aria-pressed={flipped.has(i)}
            aria-label={flipped.has(i) ? `${c.term} : ${c.definition}` : `Retourner la carte ${c.term}`}
          >
            <span className={`relative block size-full transition-transform duration-700 [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(0.34,1.3,0.64,1)] ${flipped.has(i) ? "[transform:rotateY(180deg)]" : ""}`}>
              <span className="absolute inset-0 flex flex-col justify-between rounded-card bg-surface p-5 [backface-visibility:hidden]">
                <span className="text-[0.65rem] font-medium text-ink-soft">Notion {i + 1}</span>
                <span className="text-xl font-medium leading-snug tracking-tight">{c.term}</span>
                <span className="text-xs text-brand">Retourner ↻</span>
              </span>
              <span className="absolute inset-0 overflow-y-auto rounded-card bg-brand p-5 text-sm leading-relaxed text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="mb-2 block text-xs font-medium text-white/60">{c.term}</span>
                {c.definition}
              </span>
            </span>
          </button>
        ))}
      </div>
      <CompleteButton {...complete} ready={seen.size === cards.length} label={seen.size === cards.length ? "Valider et continuer" : `Retournez toutes les cartes (${seen.size}/${cards.length})`} />
    </div>
  );
}

// ---------- Association ----------

/** Mélange déterministe : le même ordre côté serveur et côté navigateur. */
function shuffled<T>(items: T[], seed: number) {
  const a = items.map((v, i) => ({ v, k: Math.sin(seed * 9301 + i * 49297) }));
  return a.sort((x, y) => x.k - y.k).map((x) => x.v);
}

export function MatchActivity({ instruction, pairs, seed, ...complete }: { instruction: string; pairs: { left: string; right: string }[]; seed: number } & CompleteProps) {
  const options = useMemo(() => shuffled(pairs.map((p) => p.right), seed), [pairs, seed]);
  const [choices, setChoices] = useState<(string | "")[]>(() => pairs.map(() => ""));
  const [checked, setChecked] = useState(false);
  const correct = choices.filter((c, i) => c === pairs[i].right).length;
  const allRight = correct === pairs.length;

  return (
    <div className="space-y-6">
      <p className="rounded-card bg-brand-50 p-4 text-sm">{instruction}</p>
      <ol className="space-y-3">
        {pairs.map((p, i) => {
          const state = !checked ? "border-hairline" : choices[i] === p.right ? "border-brand bg-brand-50" : "border-red-300 bg-red-50";
          return (
            <li key={i} className={`grid gap-3 rounded-card border p-4 transition-colors sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center ${state}`}>
              <span className="font-medium">{p.left}</span>
              <select
                value={choices[i]}
                onChange={(e) => {
                  setChecked(false);
                  setChoices((c) => c.map((v, j) => (j === i ? e.target.value : v)));
                }}
                className="field"
                aria-label={`Associer à ${p.left}`}
              >
                <option value="">Choisir…</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-4">
        {!allRight || !checked ? (
          <button className="btn-outline" disabled={choices.some((c) => !c)} onClick={() => setChecked(true)}>Vérifier</button>
        ) : null}
        {checked && (
          <p className={`text-sm font-medium ${allRight ? "text-brand" : "text-red-700"}`}>
            {allRight ? "Parfait, tout est juste !" : `${correct}/${pairs.length} bonnes associations : corrigez les lignes en rouge.`}
          </p>
        )}
      </div>
      {checked && allRight && <CompleteButton {...complete} ready />}
    </div>
  );
}

// ---------- Questions de réflexion ----------

export function Reflection({ itemId, questions, ...complete }: { itemId: number; questions: { question: string; hint: string }[] } & CompleteProps) {
  const storageKey = `dicampus-reflexion-${itemId}`;
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  // Les réponses restent dans ce navigateur : un brouillon personnel, non noté.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (Array.isArray(saved)) setAnswers(questions.map((_, i) => String(saved[i] ?? "")));
    } catch {}
  }, [storageKey, questions]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {}
  }, [storageKey, answers]);

  const written = answers.filter((a) => a.trim().length >= 10).length;

  return (
    <div className="space-y-6">
      <p className="rounded-card bg-brand-50 p-4 text-sm">
        Rédigez une réponse courte, puis comparez-la aux pistes. Vos réponses sont enregistrées dans ce navigateur uniquement.
      </p>
      {questions.map((q, i) => (
        <div key={i} className="rounded-card border border-hairline p-5">
          <p className="font-medium"><span className="mr-2 text-brand">{i + 1}.</span>{inlineMd(q.question)}</p>
          <textarea
            value={answers[i]}
            onChange={(e) => setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))}
            rows={3}
            className="field mt-3"
            placeholder="Votre réponse…"
          />
          {q.hint && (
            revealed.has(i) ? (
              <div className="mt-3 rounded-xl border-l-4 border-teal bg-teal/[0.07] p-4 text-sm">
                <p className="mb-1 text-xs font-medium text-ink-soft">Pistes de réponse</p>
                {q.hint}
              </div>
            ) : (
              <button
                onClick={() => setRevealed((s) => new Set([...s, i]))}
                disabled={answers[i].trim().length < 10}
                className="btn-ghost mt-2 px-0 text-brand disabled:text-ink-soft"
                title={answers[i].trim().length < 10 ? "Écrivez d'abord votre réponse" : undefined}
              >
                {answers[i].trim().length < 10 ? "Écrivez votre réponse pour voir les pistes" : "Comparer avec les pistes →"}
              </button>
            )
          )}
        </div>
      ))}
      <CompleteButton {...complete} ready={written >= Math.ceil(questions.length / 2)} label={written >= Math.ceil(questions.length / 2) ? "Valider et continuer" : `Répondez à au moins ${Math.ceil(questions.length / 2)} questions`} />
    </div>
  );
}
