import type { ReactNode } from "react";

/*
  Format des lectures (texte simple, sans HTML) :
    ## Titre / ### Sous-titre
    - élément de liste
    > citation
    | cellule | cellule |        (la première ligne sert d'en-tête)
    :::cas / :::def / :::retenir / :::question / :::transition   …   :::
    **gras**, *italique*
*/

const CALLOUTS: Record<string, { label?: string; className: string }> = {
  cas: { label: "🧭 Appliqué à notre cas", className: "border-l-4 border-teal bg-teal/[0.07]" },
  def: { className: "border-l-4 border-brand bg-brand-50" },
  retenir: { label: "À retenir", className: "bg-brand text-white [&_strong]:text-white" },
  question: { label: "💡 En lien avec la question fédératrice", className: "bg-surface italic" },
  transition: { label: "➡️ Pour la suite", className: "border border-hairline" },
};

export function inlineMd(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-medium text-ink">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderLines(lines: string[], keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = `${keyPrefix}-${i}`;
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith(":::")) {
      const type = line.slice(3).trim();
      const inner: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") inner.push(lines[i++]);
      i++;
      const c = CALLOUTS[type] ?? CALLOUTS.def;
      out.push(
        <div key={key} className={`rounded-card p-5 sm:p-6 ${c.className}`}>
          {c.label && <p className="mb-2 text-xs font-medium not-italic opacity-70">{c.label}</p>}
          <div className="space-y-3">{renderLines(inner, key)}</div>
        </div>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(<h2 key={key} className="pt-4 text-2xl font-bold tracking-tight">{inlineMd(line.slice(3))}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      out.push(<h3 key={key} className="pt-4 text-xl font-bold tracking-tight">{inlineMd(line.slice(4))}</h3>);
      i++;
      continue;
    }
    const group = (prefix: string) => {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith(prefix)) items.push(lines[i++].slice(prefix.length));
      return items;
    };
    if (line.startsWith("- ")) {
      out.push(
        <ul key={key} className="space-y-2">
          {group("- ").map((it, j) => (
            <li key={j} className="flex gap-3"><span className="mt-2.5 size-1.5 shrink-0 rounded-pill bg-brand" />{<span>{inlineMd(it)}</span>}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (line.startsWith("> ")) {
      const quote = group("> ");
      const author = quote.length > 1 && quote[quote.length - 1].startsWith("—") ? quote.pop() : null;
      out.push(
        <blockquote key={key} className="border-l-4 border-ghost pl-5 text-lg italic leading-relaxed">
          {quote.map((q, j) => <p key={j}>{inlineMd(q)}</p>)}
          {author && <footer className="mt-2 text-sm not-italic text-ink-soft">{author}</footer>}
        </blockquote>,
      );
      continue;
    }
    if (line.startsWith("| ")) {
      const rows = group("| ").map((r) => r.replace(/\s*\|\s*$/, "").split(" | "));
      const [head, ...body] = rows;
      out.push(
        <div key={key} className="overflow-x-auto rounded-card border border-hairline">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-surface">
              <tr>{head.map((h, j) => <th key={j} className="px-4 py-3 font-medium">{inlineMd(h)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {body.map((r, j) => (
                <tr key={j}>{r.map((cell, k) => <td key={k} className="px-4 py-3 align-top text-ink-soft">{inlineMd(cell)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    out.push(<p key={key} className="leading-relaxed">{inlineMd(line)}</p>);
    i++;
  }
  return out;
}

export function RichText({ text, className = "" }: { text: string; className?: string }) {
  return <div className={`space-y-4 text-[1.0625rem] text-ink/85 ${className}`}>{renderLines(text.split("\n"), "rt")}</div>;
}
