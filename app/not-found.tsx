import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="text-[10rem] font-medium leading-none tracking-tight text-ghost">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page introuvable</h1>
        <p className="mt-2 text-ink-soft">Cette page n&apos;existe pas ou a été déplacée.</p>
        <Link href="/" className="btn-primary mt-6">Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}
