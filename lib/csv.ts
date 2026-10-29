// Export CSV lisible directement par Excel en français : point-virgule, BOM UTF-8.

/** Une cellule : guillemets doublés, et neutralisation des formules (=, +, -, @) pour les tableurs. */
function cell(value: string | number | null | undefined) {
  const s = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function csvResponse(filename: string, rows: (string | number | null | undefined)[][]) {
  const csv = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/** Décimale à la française pour Excel. */
export function frNumber(n: number | null) {
  return n === null ? null : String(n).replace(".", ",");
}
