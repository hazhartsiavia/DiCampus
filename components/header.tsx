import Link from "next/link";
import { Arrow, Wordmark } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { SiteHeader } from "@/components/site-chrome";
import { canTeach, getCurrentUser } from "@/lib/auth";
import { listDomains, listSpecializations } from "@/lib/queries";

export function Logo() {
  return (
    <Link href="/" className="text-ink">
      <Wordmark className="text-lg" />
    </Link>
  );
}

export async function Header() {
  const user = await getCurrentUser();
  return <SiteHeader user={user ? { name: user.name, canTeach: canTeach(user), isAdmin: user.isAdmin } : null} />;
}

export async function Footer() {
  const user = await getCurrentUser();
  const domains = listDomains();
  const specs = listSpecializations();
  const columns = [
    { title: "Domaines", links: domains.map((d) => ({ href: `/explorer/${d.slug}`, label: d.name })) },
    { title: "Parcours", links: specs.map((s) => ({ href: `/parcours/${s.slug}`, label: s.title })) },
    {
      title: "Mon espace",
      links: [
        { href: "/mon-apprentissage", label: "Mon apprentissage" },
        { href: "/enregistres", label: "Cours enregistrés" },
        { href: "/certificats", label: "Certificats" },
        { href: "/recherche", label: "Recherche" },
        { href: "/enseignant", label: "Espace enseignant" },
      ],
    },
  ];

  return (
    <footer className="no-print">
      <div className="container-page pt-24">
        <Reveal from={{ opacity: 0, y: 30 }} config={{ tension: 190, friction: 26 }}>
          <div className="relative isolate overflow-hidden rounded-card-lg bg-brand px-6 py-16 text-center text-white sm:py-20">
            <Shapes />
            <p className="mx-auto max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-6xl">
              Faites le premier pas : commencez à apprendre aujourd&apos;hui
            </p>
            <Link href={user ? "/explorer" : "/inscription"} className="btn-light hover-nudge mt-8">
              {user ? "Explorer le catalogue" : "Créer un compte gratuit"} <Arrow className="nudge size-4" />
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="container-page grid gap-10 py-20 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark className="text-2xl" markClass="size-7" />
          <p className="mt-5 leading-relaxed">
            DiegoCampus : la plateforme de cours et de formations du monde universitaire d&apos;Antsiranana, à suivre à votre rythme jusqu&apos;au certificat.
          </p>
          <Link href={user ? "/mon-apprentissage" : "/inscription"} className="btn-primary mt-7">{user ? "Mon apprentissage" : "S'inscrire"}</Link>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-2xl font-bold tracking-tight">{col.title}</h2>
            <ul className="mt-5 space-y-3.5">
              {col.links.map((l) => (
                <li key={l.href}><Link href={l.href} className="transition-colors hover:text-brand">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-hairline">
        <div className="container-page flex flex-col gap-3 py-7 text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DiCampus · DiegoCampus, Antsiranana.</p>
          <p>Cours en ligne et en français</p>
        </div>
      </div>
    </footer>
  );
}

/** Formes décoratives flottantes (losange, hexagone, étoile) aux couleurs d'accent. */
export function Shapes({ light = true }: { light?: boolean }) {
  const ring = light ? "ring-4 ring-white/30" : "";
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 hidden sm:block" aria-hidden>
      <span className={`absolute left-[12%] top-8 size-14 rotate-12 rounded-2xl bg-mint ${ring}`} />
      <span className={`absolute bottom-10 left-[22%] size-16 rounded-pill bg-salmon ${ring}`} style={{ clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)" }} />
      <span className={`absolute right-[14%] top-10 size-12 -rotate-12 rounded-xl bg-salmon ${ring}`} />
      <span
        className="absolute bottom-12 right-[20%] size-16 bg-mint"
        style={{ clipPath: "polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }}
      />
    </div>
  );
}
