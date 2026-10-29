"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { reportTabSwitch, saveExamAnswers, submitExam, type ExamState } from "@/app/cours/[slug]/examen/actions";

type Props = {
  attemptId: number;
  slug: string;
  title: string;
  questions: { question: string; options: string[] }[];
  initialAnswers: Record<string, number>;
  initialState: ExamState;
  penaltyMinutes: number;
  maxSwitches: number;
};

function formatTime(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function ExamRunner({ attemptId, slug, title, questions, initialAnswers, initialState, penaltyMinutes, maxSwitches }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [state, setState] = useState<ExamState>(initialState);
  const [current, setCurrent] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [warning, setWarning] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Décalage entre l'horloge du serveur et celle du navigateur : le chronomètre suit l'heure du serveur.
  const offset = useRef(initialState.serverNow - Date.now());
  const hidden = useRef(false);
  const lastSwitch = useRef(0);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const running = state.status === "in_progress";

  const apply = useCallback((next: ExamState) => {
    offset.current = next.serverNow - Date.now();
    setState(next);
  }, []);

  // Chronomètre.
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, [running]);

  const remaining = state.deadline - (now + offset.current);

  const submit = useCallback(async () => {
    setBusy(true);
    try {
      apply(await submitExam(attemptId, answersRef.current));
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }, [attemptId, apply]);

  // Temps écoulé : la copie est rendue avec les réponses déjà données.
  useEffect(() => {
    if (running && remaining <= 0 && !busy) void submit();
  }, [running, remaining, busy, submit]);

  // Changements d'onglet : chaque sortie de la page coûte du temps ; le dernier arrête l'examen.
  useEffect(() => {
    if (!running) return;
    const onVisibility = async () => {
      if (document.visibilityState === "hidden" && !hidden.current) {
        hidden.current = true;
        // Le serveur ignore aussi les doublons ; ce filtre évite un aller-retour inutile.
        if (Date.now() - lastSwitch.current < 2000) return;
        lastSwitch.current = Date.now();
        try {
          const next = await reportTabSwitch(attemptId);
          apply(next);
          setWarning(next.switches);
        } catch {
          setSaveError(true);
        }
      } else if (document.visibilityState === "visible") {
        hidden.current = false;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [running, attemptId, apply]);

  // Avertit avant de quitter la page pendant l'examen.
  useEffect(() => {
    if (!running) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [running]);

  // Enregistrement automatique des réponses.
  const firstSave = useRef(true);
  useEffect(() => {
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    if (!running) return;
    const t = window.setTimeout(async () => {
      try {
        apply(await saveExamAnswers(attemptId, answers));
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [answers, running, attemptId, apply]);

  const answeredCount = Object.keys(answers).length;

  if (!running) {
    const reason =
      state.status === "terminated" ? `L'examen a été arrêté après ${maxSwitches} changements d'onglet.` :
      state.status === "expired" ? "Le temps imparti est écoulé." : "Votre copie a bien été rendue.";
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        <p className={`eyebrow justify-center ${state.status === "terminated" ? "text-red-700 before:bg-red-600" : ""}`}>Examen terminé</p>
        <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight">Votre note</h1>
        <p className="mt-8 text-[7rem] font-medium leading-none tracking-tight text-brand">
          {state.score?.toLocaleString("fr-FR")}<span className="text-4xl text-ink-soft">/20</span>
        </p>
        <p className="mt-4 text-ink-soft">{state.correct} bonne{(state.correct ?? 0) > 1 ? "s" : ""} réponse{(state.correct ?? 0) > 1 ? "s" : ""} sur {state.total}</p>
        <p className={`mx-auto mt-6 max-w-md rounded-card p-4 text-sm ${state.status === "terminated" ? "bg-red-50 text-red-800" : "bg-surface"}`}>
          {reason} Votre enseignant a reçu votre note.
        </p>
        <Link href={`/cours/${slug}`} className="btn-primary mt-8">Retour au cours</Link>
      </div>
    );
  }

  const q = questions[current];
  const low = remaining < 5 * 60_000;

  return (
    <div className="select-none" onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
      <div className="sticky top-2 z-30 flex flex-wrap items-center gap-4 rounded-card-lg bg-brand-deep px-5 py-4 text-white sm:px-8">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-white/60">{title}</p>
          <p className="text-sm text-white/80">{answeredCount}/{questions.length} réponses · enregistrement automatique{saveError ? " (connexion instable…)" : ""}</p>
        </div>
        <div className="flex items-center gap-2" aria-label={`${state.switches} changement(s) d'onglet sur ${maxSwitches}`}>
          {Array.from({ length: maxSwitches }, (_, i) => (
            <span key={i} className={`size-2.5 rounded-pill ${i < state.switches ? "bg-red-400" : "bg-white/25"}`} />
          ))}
        </div>
        <p className={`font-medium tabular-nums tracking-tight ${low ? "text-red-300" : ""} text-4xl`} role="timer" aria-live="off">{formatTime(remaining)}</p>
        <button onClick={() => setConfirming(true)} className="btn-light px-5 py-2.5" disabled={busy}>Rendre la copie</button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_16rem]">
        <section className="rounded-card-lg bg-surface p-6 sm:p-10">
          <p className="text-sm font-medium text-brand">Question {current + 1} sur {questions.length}</p>
          <h2 className="mt-3 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">{q.question}</h2>
          <div className="mt-8 grid gap-3">
            {q.options.map((opt, oi) => {
              const chosen = answers[current] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers((a) => ({ ...a, [current]: oi }))}
                  className={`flex items-start gap-4 rounded-card border-2 bg-white p-4 text-left transition-colors sm:p-5 ${chosen ? "border-brand" : "border-transparent hover:border-hairline"}`}
                  aria-pressed={chosen}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-pill text-sm font-medium ${chosen ? "bg-brand text-white" : "bg-surface"}`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="pt-1">{opt}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-between gap-3">
            <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="btn-ghost disabled:opacity-40">← Précédente</button>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">Suivante →</button>
            ) : (
              <button onClick={() => setConfirming(true)} className="btn-primary">Terminer</button>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-card border border-hairline p-4">
            <p className="mb-3 text-xs font-medium text-ink-soft">Questions</p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`aspect-square rounded-xl text-sm font-medium ${i === current ? "ring-2 ring-brand ring-offset-2" : ""} ${answers[i] !== undefined ? "bg-brand text-white" : "bg-surface"}`}
                  aria-label={`Question ${i + 1}${answers[i] !== undefined ? ", répondue" : ""}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-card bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            Ne quittez pas cet onglet : chaque changement retire {penaltyMinutes} minutes. Au {maxSwitches}<sup>e</sup>, l&apos;examen s&apos;arrête et votre note est envoyée.
          </div>
        </aside>
      </div>

      {(warning !== null || confirming) && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-brand-deep/40 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-card-lg bg-white p-6 shadow-2xl sm:p-8">
            {confirming ? (
              <>
                <p className="eyebrow">Rendre la copie</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Terminer l&apos;examen ?</h2>
                <p className="mt-3 text-ink-soft">
                  Vous avez répondu à {answeredCount} question{answeredCount > 1 ? "s" : ""} sur {questions.length}.
                  {answeredCount < questions.length ? " Les questions sans réponse compteront comme fausses." : ""} Vous ne pourrez plus modifier vos réponses.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={submit} disabled={busy} className="btn-primary">{busy ? "Envoi…" : "Rendre ma copie"}</button>
                  <button onClick={() => setConfirming(false)} className="btn-ghost">Continuer l&apos;examen</button>
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow text-red-700 before:bg-red-600">Changement d&apos;onglet détecté</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Avertissement {warning}/{maxSwitches}</h2>
                <p className="mt-3 text-ink-soft">
                  Vous avez quitté l&apos;onglet de l&apos;examen : <strong className="font-medium text-ink">{penaltyMinutes} minutes ont été retirées</strong> de votre temps.
                </p>
                {warning !== null && warning === maxSwitches - 1 && (
                  <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">
                    Dernier avertissement : au prochain changement d&apos;onglet, l&apos;examen sera arrêté et votre note envoyée.
                  </p>
                )}
                <button onClick={() => setWarning(null)} className="btn-primary mt-6">J&apos;ai compris, reprendre</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
