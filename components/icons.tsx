export function Mark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 4 2 9l10 5 10-5-10-5Z" />
      <path d="M6 11.2V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.8" />
      <path d="M22 9v5" />
    </svg>
  );
}

export function Arrow({ className = "size-4", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Close({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function Wordmark({ className = "", markClass = "size-6" }: { className?: string; markClass?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold tracking-tight ${className}`}>
      <Mark className={`${markClass} text-brand`} />
      <span>Di<span className="text-brand">Campus</span></span>
    </span>
  );
}
