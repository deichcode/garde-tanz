/* Hilfen für Anzeige und Gerät. */

const fmtDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtTime = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

export function dateDE(iso: string | Date | undefined | null): string {
  if (!iso) return '–';
  return fmtDate.format(new Date(iso));
}

export function timeDE(iso: string | Date): string {
  return fmtTime.format(new Date(iso));
}

/** „gerade eben“, „vor 5 Min.“, „vor 3 Std.“, „gestern“, „vor 4 Tagen“, sonst Datum. */
export function ago(iso: string | undefined | null, nowMs = Date.now()): string {
  if (!iso) return '';
  const s = Math.max(0, (nowMs - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'gerade eben';
  if (s < 3600) return `vor ${Math.floor(s / 60)} Min.`;
  if (s < 86400) return `vor ${Math.floor(s / 3600)} Std.`;
  const d = Math.floor(s / 86400);
  if (d === 1) return 'gestern';
  if (d < 14) return `vor ${d} Tagen`;
  return `am ${dateDE(iso)}`;
}

export function daysSince(iso: string | undefined | null, nowMs = Date.now()): number | null {
  if (!iso) return null;
  return Math.floor((nowMs - new Date(iso).getTime()) / 86400000);
}

/* --- Gerät: Offline-Speicher (Risiko 3) ---------------------------------- */

export function isInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** Bittet den Browser, die Daten nicht zu löschen (iOS: nur in der installierten App wirksam). */
export async function requestPersist(): Promise<boolean> {
  try {
    if (await navigator.storage?.persisted?.()) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

export async function storageInfo(): Promise<{ persisted: boolean | null; usage: number | null; quota: number | null }> {
  try {
    const [persisted, est] = await Promise.all([navigator.storage?.persisted?.() ?? null, navigator.storage?.estimate?.() ?? null]);
    return { persisted, usage: est?.usage ?? null, quota: est?.quota ?? null };
  } catch {
    return { persisted: null, usage: null, quota: null };
  }
}

export function mb(bytes: number | null): string {
  if (bytes == null) return '–';
  return `${(bytes / 1024 / 1024).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB`;
}

const DEVICE_KEY = 'garde-tanz:geraet-seit';
/** Seit wann ist dieses Gerät angemeldet? Für den 30-Tage-Test der Sitzung (Risiko 6). */
export function deviceSince(): string {
  try {
    let v = localStorage.getItem(DEVICE_KEY);
    if (!v) {
      v = new Date().toISOString();
      localStorage.setItem(DEVICE_KEY, v);
    }
    return v;
  } catch {
    return new Date().toISOString();
  }
}
export function forgetDevice() {
  try {
    localStorage.removeItem(DEVICE_KEY);
  } catch {
    /* egal */
  }
}
