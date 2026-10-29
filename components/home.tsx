"use client";

import Link from "next/link";
import { useRef } from "react";
import { Arrow } from "@/components/icons";

export type DomainTile = { slug: string; name: string; icon: string; count: number };

const TINTS = ["bg-brand-50", "bg-salmon-50", "bg-mint-50", "bg-sun-50"];
const ICON_TINTS = ["bg-brand text-white", "bg-salmon text-ink", "bg-mint text-ink", "bg-[#ffd76a] text-ink"];

export function ArrowButton({ dir, onClick, label }: { dir: -1 | 1; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="grid size-12 place-items-center rounded-pill border border-brand text-brand transition-colors hover:bg-brand hover:text-white"
      aria-label={label}
    >
      <Arrow className="size-5" flip={dir < 0} />
    </button>
  );
}

/** Domaines en cartes pastel qui défilent horizontalement. */
export function DomainScroller({ domains }: { domains: DomainTile[] }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 260) + 24), behavior: "smooth" });
  };
  return (
    <div className="min-w-0">
      <ul ref={track} className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {domains.map((d, i) => (
          <li key={d.slug} className="w-[15.5rem] shrink-0 snap-start">
            <Link href={`/explorer/${d.slug}`} className={`hover-lift flex h-full min-h-[13rem] flex-col justify-between rounded-card-lg p-6 ${TINTS[i % TINTS.length]}`}>
              <span className={`grid size-14 place-items-center rounded-card text-xl font-bold ${ICON_TINTS[i % ICON_TINTS.length]}`} aria-hidden>{d.icon}</span>
              <span>
                <span className="block text-2xl font-bold leading-tight tracking-tight">{d.name}</span>
                <span className="mt-2 block">{d.count} cours</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex gap-4">
        <ArrowButton dir={-1} onClick={() => scroll(-1)} label="Domaines précédents" />
        <ArrowButton dir={1} onClick={() => scroll(1)} label="Domaines suivants" />
      </div>
    </div>
  );
}
