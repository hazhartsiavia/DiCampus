import Link from "next/link";
import { Arrow } from "@/components/icons";
import type { CourseCard as Card } from "@/lib/queries";

export function Thumb({ hue, title, className = "" }: { hue: number; title: string; className?: string }) {
  const initials = title
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <div
      className={`${className.includes("absolute") ? "" : "relative"} flex items-end overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${(hue + 40) % 360} 85% 62%), hsl(${hue} 75% 45%))` }}
      aria-hidden
    >
      <div className="absolute -right-6 -top-6 size-28 rounded-pill bg-white/10" />
      <div className="absolute right-10 top-10 size-14 rounded-pill bg-white/10" />
      <span className="p-4 text-3xl font-bold tracking-tight text-white/95">{initials}</span>
    </div>
  );
}

export function Stars({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <span className={`${size} tracking-tight text-[#f7a325]`} aria-label={`${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(rating) ? "" : "text-ghost"}>★</span>
      ))}
    </span>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-hairline px-3 py-1 text-sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-ink-soft" aria-hidden>{icon}</svg>
      {children}
    </span>
  );
}

export function CourseCard({ course }: { course: Card }) {
  return (
    <Link href={`/cours/${course.slug}`} className="hover-lift group flex h-full flex-col rounded-card-lg border border-hairline bg-white p-4">
      <div className="hover-zoom relative overflow-hidden rounded-card">
        <Thumb hue={course.hue} title={course.title} className="zoom aspect-[16/10]" />
        {course.rating ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-pill bg-white px-3 py-1 text-sm font-semibold">
            <span className="text-[#f7a325]">★</span> {course.rating.toFixed(1)}
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-pill bg-white px-3 py-1 text-sm font-semibold">{course.level}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pt-5">
        <h3 className="text-[1.375rem] font-bold leading-snug tracking-tight transition-colors group-hover:text-brand">{course.title}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip icon={<><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z" /><path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" /></>}>{course.module_count} module{course.module_count > 1 ? "s" : ""}</Chip>
          <Chip icon={<><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2" /></>}>{course.hours} h</Chip>
          <Chip icon={<><path d="M12 4 2 9l10 5 10-5-10-5Z" /><path d="M6 11.2V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.8" /></>}>{course.learners} inscrit{course.learners > 1 ? "s" : ""}</Chip>
        </div>
        <div className="mt-auto flex items-center gap-3 pt-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-brand-50 text-xs font-bold text-brand">{course.partner_short}</span>
          <span className="min-w-0 flex-1 truncate font-semibold" title={course.partner_name}>{course.partner_name}</span>
        </div>
      </div>
    </Link>
  );
}

export function CourseGrid({ courses }: { courses: Card[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <CourseCard key={c.id} course={c} />
      ))}
    </div>
  );
}

/** Université, parcours et niveau d'un élève, sur une ligne (vide pour les comptes créés avant ces champs). */
export function profileLine(p: { university: string | null; program: string | null; study_level: string | null }) {
  return [p.study_level, p.program, p.university].filter(Boolean).join(" · ");
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-pill bg-brand-50" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-pill bg-brand transition-all duration-700" style={{ width: `${value}%` }} />
    </div>
  );
}

export function EmptyState({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="rounded-card bg-surface p-10 text-center">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{text}</p>
      <Link href={href} className="btn-primary hover-nudge mt-6">{cta} <Arrow className="nudge size-4" /></Link>
    </div>
  );
}

const ITEM_KINDS: Record<string, { icon: string; label: string }> = {
  video: { icon: "▶", label: "Vidéo" },
  reading: { icon: "≡", label: "Lecture" },
  quiz: { icon: "?", label: "Quiz" },
  cards: { icon: "◫", label: "Glossaire" },
  match: { icon: "⇄", label: "Association" },
  reflection: { icon: "✎", label: "Réflexion" },
  tp: { icon: "⚒", label: "TP" },
};

export function itemIcon(kind: string) {
  return ITEM_KINDS[kind]?.icon ?? "•";
}

export function itemLabel(kind: string) {
  return ITEM_KINDS[kind]?.label ?? "Activité";
}
