/* Begriffe der Bausteine. Schlüssel eines Katalog-Eintrags = Rolle + normalisierter Begriff. */

/** „ Präs “ → „präs“, „1/4  Dreh“ → „1/4 dreh“ */
export function normalizeTerm(s: string): string {
  return s.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('de');
}

/** Dokument-ID eines Katalog-Eintrags. Rolle '*' = gemeinsamer Baustein. */
export function roleActionId(roleId: string, label: string): string {
  return `${roleId}~${encodeURIComponent(normalizeTerm(label))}`;
}
