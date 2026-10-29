"use client";

import {
  createContext, useContext, useEffect, useLayoutEffect, useRef, useState,
  type CSSProperties, type ElementType, type ReactNode,
} from "react";
import { applyState, prefersReducedMotion, springTo, type SpringConfig, type SpringState } from "@/lib/spring";

// ---------- Verrouillage du défilement (menu mobile) ----------

let locks = 0;

export function lockScroll() {
  locks++;
  document.documentElement.classList.add("scroll-locked");
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  document.documentElement.classList.remove("scroll-locked");
}

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return false;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  return true;
}

const ReadyContext = createContext(true);

export function useReady() {
  return useContext(ReadyContext);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return <ReadyContext.Provider value={true}>{children}</ReadyContext.Provider>;
}

// ---------- Visibilité ----------

export function useInView<T extends Element>(once = true) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  return [ref, inView] as const;
}

/** Ajoute `is-in` au premier passage dans la vue, en attendant `ready` si `gated`. Rejoue quand `replayKey` change. */
function useRevealClass<T extends Element>(gated: boolean, replayKey?: unknown) {
  const [ref, inView] = useInView<T>();
  const ready = useReady();
  const [on, setOn] = useState(false);
  const active = inView && (!gated || ready);
  useEffect(() => {
    setOn(false);
    if (!active) return;
    // Deux images : laisse le navigateur peindre l'état masqué avant de lancer la transition.
    let id = requestAnimationFrame(() => (id = requestAnimationFrame(() => setOn(true))));
    return () => cancelAnimationFrame(id);
  }, [active, replayKey]);
  return [ref, on] as const;
}

type LinesProps = {
  lines: string[];
  as?: ElementType;
  className?: string;
  stagger?: number;
  baseDelay?: number;
  duration?: number;
  gated?: boolean;
  id?: string;
};

const fadeStyle = (on: boolean, delay: number): CSSProperties => ({
  display: "block",
  opacity: on ? 1 : 0,
  transform: on ? "none" : "translateY(16px)",
  transition: `opacity 700ms var(--ease-out-quart) ${delay}ms, transform 700ms var(--ease-out-quart) ${delay}ms`,
});

/** Lignes empilées qui apparaissent en fondu montant. */
export function StackedLines({ lines, as: Tag = "h2", className = "", stagger = 90, baseDelay = 0, gated = false, id }: LinesProps) {
  const [ref, on] = useRevealClass<HTMLElement>(gated, lines.join("|"));
  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} style={fadeStyle(on, baseDelay + i * stagger)}>{line}</span>
      ))}
    </Tag>
  );
}

/** Texte qui apparaît en fondu montant. */
export function Words({ text, as: Tag = "span", className = "", baseDelay = 0, gated = false, id }: {
  text: string; as?: ElementType; className?: string; stagger?: number; baseDelay?: number; duration?: number; gated?: boolean; id?: string;
}) {
  const [ref, on] = useRevealClass<HTMLElement>(gated, text);
  return <Tag ref={ref} id={id} className={className} style={fadeStyle(on, baseDelay)}>{text}</Tag>;
}

/** Paragraphe qui apparaît en fondu montant. */
export function FadeWords({ text, className = "", baseDelay = 150 }: { text: string; className?: string; stagger?: number; baseDelay?: number }) {
  const [ref, on] = useRevealClass<HTMLParagraphElement>(false);
  return <p ref={ref} className={className} style={fadeStyle(on, baseDelay)}>{text}</p>;
}

/** Apparition au ressort la première fois que l'élément entre dans la vue. */
export function Reveal({ children, from = { opacity: 0, y: 28 }, to = { opacity: 1, y: 0 }, delay = 0, config = { tension: 200, friction: 26 }, gated = false, as: Tag = "div", className = "", style }: {
  children: ReactNode; from?: SpringState; to?: SpringState; delay?: number; config?: SpringConfig; gated?: boolean;
  as?: ElementType; className?: string; style?: CSSProperties;
}) {
  const [ref, inView] = useInView<HTMLElement>();
  const ready = useReady();
  const active = inView && (!gated || ready);

  useLayoutEffect(() => {
    if (ref.current && !prefersReducedMotion()) applyState(ref.current, from);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    if (prefersReducedMotion()) {
      applyState(el, { ...from, ...to });
      return;
    }
    const t = window.setTimeout(() => springTo(el, from, { ...from, ...to }, config), delay);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return <Tag ref={ref} className={className} style={{ opacity: 0, ...style }}>{children}</Tag>;
}

/** Translation liée à la progression de la section parente dans la fenêtre (0 en entrant par le bas, 1 en sortant par le haut). */
export function Parallax({ children, from, to, axis = "y", className = "", style }: {
  children?: ReactNode; from: number; to: number; axis?: "x" | "y"; className?: string; style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const section = (el.closest("section, footer") as HTMLElement) ?? el.parentElement!;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      const v = from + (to - from) * p;
      el.style.transform = axis === "y" ? `translate3d(0, ${v}%, 0)` : `translate3d(${v}%, 0, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [from, to, axis]);
  return <div ref={ref} className={className} style={style}>{children}</div>;
}

/** Liens d'ancre internes : défilement fluide. */
export function AnchorLink({ href, className, children, onClick }: { href: string; className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        onClick?.();
        if (href.startsWith("#") && scrollToHash(href)) e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
