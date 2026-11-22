/* Wer darf in die App? Mitglieder und Besitzer der M365-Gruppe „Garde-Tanz“ (Konzept 6.1).
   Besitzer sind die Admins (Trainerleitung). Reine Logik, ohne Netz – dadurch testbar. */

export interface Roster {
  members: Set<string>; // Objekt-IDs der Mitglieder (auch über verschachtelte Gruppen)
  owners: Set<string>; // Objekt-IDs der Besitzer
}

export interface Access {
  member: boolean;
  admin: boolean;
}

export function decide(roster: Roster, oid: string): Access {
  const admin = roster.owners.has(oid);
  return { member: admin || roster.members.has(oid), admin };
}

/** Nutzdaten eines JWT lesen. Die Signatur prüft Firebase, bevor die Funktion aufgerufen wird. */
export function jwtPayload(token: string | undefined): Record<string, unknown> | null {
  const part = token?.split('.')[1];
  if (!part) return null;
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export interface MsIdentity {
  oid: string | null; // Objekt-ID im Vereins-Tenant (bei Gästen: das Gastkonto)
  tid: string | null; // Tenant, der das Token ausgestellt hat
}

/** Microsoft-Identität aus dem Anmelde-Ereignis: Claims des ID-Tokens, sonst das Graph-Profil. */
export function msIdentity(event: {
  credential?: { claims?: Record<string, unknown>; idToken?: string } | null;
  additionalUserInfo?: { profile?: Record<string, unknown> } | null;
}): MsIdentity {
  const claims = event.credential?.claims ?? jwtPayload(event.credential?.idToken) ?? {};
  const str = (v: unknown) => (typeof v === 'string' && v ? v : null);
  return {
    oid: str(claims.oid) ?? str(event.additionalUserInfo?.profile?.id),
    tid: str(claims.tid),
  };
}
