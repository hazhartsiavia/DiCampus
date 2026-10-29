// Ressort minimal sur le modèle { tension, friction } de react-spring, intégré dans requestAnimationFrame.

export type SpringState = { opacity?: number; x?: number; y?: number; scale?: number; rotate?: number };
export type SpringConfig = { tension: number; friction: number };

const KEYS = ["opacity", "x", "y", "scale", "rotate"] as const;
const DEFAULTS: Required<SpringState> = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 };

export function applyState(el: HTMLElement, s: SpringState, unit: "px" | "%" = "px") {
  const v = { ...DEFAULTS, ...s };
  el.style.opacity = String(v.opacity);
  el.style.transform = `translate3d(${v.x}${unit}, ${v.y}${unit}, 0) scale(${v.scale}) rotate(${v.rotate}deg)`;
}

const running = new WeakMap<HTMLElement, number>();
// Position et vitesse courantes : une animation interrompue repart de là où elle en était.
const live = new WeakMap<HTMLElement, { pos: Record<string, number>; vel: Record<string, number> }>();

/** Oublie l'état courant : la prochaine animation repartira de son `from`. */
export function resetSpring(el: HTMLElement) {
  live.delete(el);
}

/** Anime `el` de son état courant vers `to`. Renvoie une fonction d'annulation. */
export function springTo(el: HTMLElement, from: SpringState, to: SpringState, config: SpringConfig, unit: "px" | "%" = "px") {
  const prev = running.get(el);
  if (prev) cancelAnimationFrame(prev);

  const current = live.get(el);
  const pos: Record<string, number> = current?.pos ?? {};
  const vel: Record<string, number> = current?.vel ?? {};
  const target: Record<string, number> = {};
  for (const k of KEYS) {
    if (!current) {
      pos[k] = from[k] ?? DEFAULTS[k];
      vel[k] = 0;
    }
    target[k] = to[k] ?? from[k] ?? DEFAULTS[k];
  }
  live.set(el, { pos, vel });
  // Les distances en px sont ramenées à une échelle proche de l'opacité pour un seuil d'arrêt commun.
  const scale = (k: string) => (k === "opacity" || k === "scale" ? 1 : 0.01);

  let last = performance.now();
  const tick = (now: number) => {
    let dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    let settled = true;
    // Sous-pas pour la stabilité avec des tensions élevées.
    const steps = 4;
    dt /= steps;
    for (let i = 0; i < steps; i++) {
      for (const k of KEYS) {
        const force = -config.tension * (pos[k] - target[k]) - config.friction * vel[k];
        vel[k] += force * dt;
        pos[k] += vel[k] * dt;
      }
    }
    for (const k of KEYS) {
      if (Math.abs(pos[k] - target[k]) * scale(k) > 0.001 || Math.abs(vel[k]) * scale(k) > 0.001) settled = false;
    }
    if (settled) for (const k of KEYS) pos[k] = target[k];
    applyState(el, pos as SpringState, unit);
    if (!settled) running.set(el, requestAnimationFrame(tick));
    else running.delete(el);
  };
  running.set(el, requestAnimationFrame(tick));
  return () => {
    const id = running.get(el);
    if (id) cancelAnimationFrame(id);
  };
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
