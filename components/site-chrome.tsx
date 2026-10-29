"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions";
import { Close, Wordmark } from "@/components/icons";
import { lockScroll, unlockScroll } from "@/components/motion";

type ChromeUser = { name: string; canTeach: boolean; isAdmin: boolean } | null;

function SearchIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function navLinks(user: ChromeUser) {
  return [
    { href: "/", label: "Accueil" },
    { href: "/explorer", label: "Catalogue" },
    { href: "/#parcours", label: "Parcours" },
    ...(user ? [{ href: "/mon-apprentissage", label: "Mon apprentissage" }] : []),
    ...(user?.canTeach ? [{ href: "/enseignant", label: "Espace enseignant" }] : []),
    ...(user?.isAdmin ? [{ href: "/admin", label: "Administration" }] : []),
  ];
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

export function SiteHeader({ user }: { user: ChromeUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Ferme les menus après une navigation.
  useEffect(() => {
    setOpen(false);
    setAccount(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open]);

  useEffect(() => {
    if (!account) return;
    const onClick = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccount(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAccount(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [account]);

  if (pathname.endsWith("/examen/passer")) return null;
  const links = navLinks(user);

  const search = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    router.push(q ? `/recherche?q=${encodeURIComponent(q)}` : "/recherche");
  };

  return (
    <>
    <header className="no-print sticky top-0 z-50 border-b border-hairline bg-white/95 backdrop-blur">
      <div className="container-page flex h-[4.5rem] items-center gap-6 lg:h-24">
        <Link href="/" aria-label="DiCampus, accueil" className="shrink-0">
          <Wordmark className="text-2xl" markClass="size-7" />
        </Link>

        <nav className="hidden flex-1 justify-center gap-5 lg:flex xl:gap-8" aria-label="Navigation principale">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap text-base transition-colors hover:text-brand xl:text-[1.0625rem] ${isActive(pathname, l.href) ? "text-brand" : "text-ink"}`}
              aria-current={isActive(pathname, l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
          <Link href="/recherche" className="grid size-11 place-items-center rounded-pill text-ink transition-colors hover:bg-surface hover:text-brand" aria-label="Rechercher un cours">
            <SearchIcon />
          </Link>

          {user ? (
            <div ref={accountRef} className="relative hidden lg:block">
              <button
                onClick={() => setAccount((v) => !v)}
                className="flex items-center gap-2 rounded-pill bg-ink py-1.5 pl-1.5 pr-5 text-base font-bold text-white transition-colors hover:bg-brand"
                aria-expanded={account}
                aria-haspopup="menu"
              >
                <span className="grid size-9 place-items-center rounded-pill bg-brand text-sm">{initials(user.name)}</span>
                Mon compte
              </button>
              {account && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-card border border-hairline bg-white p-2 shadow-[0_1.5rem_3rem_-1.5rem_rgb(40_17_57_/_0.25)]" role="menu">
                  <p className="truncate px-3 pb-2 pt-1 text-sm text-ink-soft">{user.name}</p>
                  {[
                    { href: "/mon-apprentissage", label: "Mon apprentissage" },
                    { href: "/enregistres", label: "Cours enregistrés" },
                    { href: "/certificats", label: "Mes certificats" },
                    { href: "/enseignant", label: user.canTeach ? "Espace enseignant" : "Devenir enseignant" },
                  ].map((l) => (
                    <Link key={l.href} href={l.href} className="block rounded-xl px-3 py-2.5 hover:bg-surface hover:text-brand" role="menuitem">{l.label}</Link>
                  ))}
                  <form action={logout} className="mt-1 border-t border-hairline pt-1">
                    <button className="w-full rounded-xl px-3 py-2.5 text-left text-ink-soft hover:bg-surface hover:text-ink" role="menuitem">Se déconnecter</button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-3 lg:flex">
              <Link href="/connexion" className="px-3 text-[1.0625rem] hover:text-brand">Connexion</Link>
              <Link href="/inscription" className="btn-primary">S&apos;inscrire</Link>
            </div>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 place-items-center rounded-pill bg-ink text-white lg:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
          >
            {open ? (
              <Close className="size-5" />
            ) : (
              <span className="flex flex-col gap-[5px]" aria-hidden>
                <span className="block h-0.5 w-5 rounded-pill bg-white" />
                <span className="block h-0.5 w-5 rounded-pill bg-white" />
                <span className="block h-0.5 w-5 rounded-pill bg-white" />
              </span>
            )}
          </button>
        </div>
      </div>
    </header>

      {/* ---------- Menu mobile (hors de l'en-tête : son flou capturerait la position fixe) ---------- */}
      {open && (
        <div id="menu-mobile" className="no-print fixed inset-x-0 bottom-0 top-[4.5rem] z-50 overflow-y-auto border-t border-hairline bg-white lg:hidden">
          <div className="container-page flex min-h-full flex-col gap-6 py-6">
            <form role="search" onSubmit={search} className="flex items-center gap-2 rounded-pill border border-hairline bg-surface py-1.5 pl-5 pr-1.5">
              <input name="q" type="search" placeholder="Rechercher un cours…" className="w-full bg-transparent outline-none" aria-label="Rechercher un cours" />
              <button className="grid size-10 shrink-0 place-items-center rounded-pill bg-ink text-white" aria-label="Rechercher"><SearchIcon className="size-4" /></button>
            </form>
            <nav aria-label="Menu" className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`border-b border-hairline py-4 text-2xl font-bold tracking-tight ${isActive(pathname, l.href) ? "text-brand" : ""}`}
                >
                  {l.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link href="/enregistres" className="border-b border-hairline py-4 text-lg">Cours enregistrés</Link>
                  <Link href="/certificats" className="border-b border-hairline py-4 text-lg">Mes certificats</Link>
                  {!user.canTeach && <Link href="/enseignant" className="border-b border-hairline py-4 text-lg">Devenir enseignant</Link>}
                </>
              )}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              {user ? (
                <form action={logout}><button className="btn-ghost w-full border border-hairline">Se déconnecter ({user.name})</button></form>
              ) : (
                <>
                  <Link href="/inscription" className="btn-primary w-full">S&apos;inscrire gratuitement</Link>
                  <Link href="/connexion" className="btn-outline w-full">Connexion</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
