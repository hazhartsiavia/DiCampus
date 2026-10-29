"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/db";

const PASS_RATIO = 2 / 3;

export function Quiz({ questions, completeAction, alreadyDone }: {
  questions: QuizQuestion[];
  completeAction?: () => Promise<void>;
  alreadyDone: boolean;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const score = answers.filter((a, i) => a === questions[i].answer).length;
  const passed = score / questions.length >= PASS_RATIO;

  return (
    <div className="space-y-6">
      <p className="rounded-lg bg-brand-50 p-4 text-sm text-brand-900">
        Répondez aux {questions.length} questions. Il faut au moins {Math.ceil(questions.length * PASS_RATIO)} bonnes réponses pour valider le quiz.
      </p>
      {questions.map((q, qi) => (
        <fieldset key={qi} className="rounded-xl border border-hairline p-5">
          <legend className="px-1 text-sm font-medium text-ink-soft">Question {qi + 1}</legend>
          <p className="font-medium">{q.question}</p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oi) => {
              const chosen = answers[qi] === oi;
              const state = !submitted ? "" : oi === q.answer ? "border-brand-600 bg-brand-50" : chosen ? "border-red-400 bg-red-50" : "";
              return (
                <label key={oi} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${state || (chosen ? "border-brand-600" : "border-hairline hover:border-ghost")}`}>
                  <input
                    type="radio"
                    name={`q${qi}`}
                    className="mt-0.5 accent-brand-700"
                    checked={chosen}
                    disabled={submitted}
                    onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {!submitted ? (
        <button className="btn-primary" disabled={answers.some((a) => a === null)} onClick={() => setSubmitted(true)}>
          Valider mes réponses
        </button>
      ) : (
        <div className={`rounded-xl p-5 ${passed ? "bg-brand-50 text-brand-900" : "bg-amber-50 text-amber-900"}`}>
          <p className="text-lg font-medium">{score}/{questions.length} : {passed ? "quiz réussi !" : "pas tout à fait."}</p>
          <p className="mt-1 text-sm">{passed ? "Vous pouvez passer à la suite." : "Relisez la lecture du module puis réessayez."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {passed && !alreadyDone && completeAction && (
              <form action={completeAction}><button className="btn-primary">Valider et continuer</button></form>
            )}
            <button
              className="btn-outline"
              onClick={() => {
                setSubmitted(false);
                setAnswers(questions.map(() => null));
              }}
            >
              Recommencer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
