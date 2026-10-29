import type { Metadata } from "next";
import Link from "next/link";
import { decideTeacherRequest } from "@/app/enseignant/actions";
import { requireAdmin } from "@/lib/auth";
import { listTeacherRequests } from "@/lib/teaching";

export const metadata: Metadata = { title: "Demandes enseignant" };

const STATUS = {
  pending: { label: "En attente", className: "bg-amber-100 text-amber-900" },
  approved: { label: "Acceptée", className: "bg-brand-50 text-brand-800" },
  refused: { label: "Refusée", className: "bg-red-50 text-red-800" },
};

export default async function TeacherRequestsPage() {
  await requireAdmin();
  const requests = listTeacherRequests();

  return (
    <div className="container-page max-w-4xl py-12">
      <Link href="/admin" className="text-sm text-ink-soft hover:underline">← Administration</Link>
      <p className="eyebrow mt-6">Administration</p>
      <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight">Demandes enseignant</h1>
      {requests.length === 0 ? (
        <p className="mt-10 rounded-card bg-surface p-6 text-ink-soft">Aucune demande pour le moment.</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {requests.map((r) => (
            <li key={r.id} className="rounded-card bg-surface p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-medium">{r.user_name}</p>
                  <p className="text-sm text-ink-soft">{r.user_email} · {r.partner_name}</p>
                </div>
                <span className={`rounded-pill px-3 py-1 text-xs font-medium ${STATUS[r.status].className}`}>{STATUS[r.status].label}</span>
              </div>
              <p className="mt-4 whitespace-pre-line rounded-xl bg-white p-4 text-sm leading-relaxed">{r.message}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {r.status !== "approved" && (
                  <form action={decideTeacherRequest.bind(null, r.id, true)}><button className="btn-primary">Accepter</button></form>
                )}
                {r.status !== "refused" && (
                  <form action={decideTeacherRequest.bind(null, r.id, false)}>
                    <button className="btn-ghost text-red-700">{r.status === "approved" ? "Retirer l'accès" : "Refuser"}</button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
