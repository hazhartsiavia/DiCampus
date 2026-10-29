"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions";

export function ReviewForm({ action, initialRating = 0, initialComment = "" }: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initialRating?: number;
  initialComment?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  // Champ contrôlé : React vide les champs non contrôlés après chaque envoi, même refusé.
  const [comment, setComment] = useState(initialComment);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-hairline p-5">
      <p className="font-medium">{initialRating ? "Modifier votre avis" : "Donnez votre avis sur ce cours"}</p>
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            className={`text-2xl transition ${(hover || rating) >= n ? "text-brand" : "text-ghost"}`}
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <input type="hidden" name="rating" value={rating} />
      <textarea name="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="field" placeholder="Qu'avez-vous pensé de ce cours ?" />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state && !state.error && <p className="text-sm text-brand-700">Merci, votre avis est publié.</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Envoi…" : "Publier"}</button>
    </form>
  );
}
