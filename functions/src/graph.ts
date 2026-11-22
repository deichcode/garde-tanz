/* Microsoft Graph mit App-Berechtigung GroupMember.Read.All (einmalige Admin-Zustimmung). */
import type { Roster } from './access.js';

export interface GraphConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  groupId: string;
}

type Fetch = typeof fetch;

async function token(cfg: GraphConfig, f: Fetch): Promise<string> {
  const res = await f(`https://login.microsoftonline.com/${encodeURIComponent(cfg.tenantId)}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  });
  if (!res.ok) throw new Error(`Graph-Token: HTTP ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function ids(url: string, bearer: string, f: Fetch): Promise<Set<string>> {
  const out = new Set<string>();
  let next: string | undefined = url;
  while (next) {
    const res = await f(next, { headers: { Authorization: `Bearer ${bearer}` } });
    if (!res.ok) throw new Error(`Graph ${new URL(next).pathname}: HTTP ${res.status}`);
    const body = (await res.json()) as { value: { id: string }[]; '@odata.nextLink'?: string };
    for (const v of body.value) out.add(v.id);
    next = body['@odata.nextLink'];
  }
  return out;
}

/** Mitglieder (auch verschachtelt) und Besitzer der Gruppe. Die Trainergruppe ist klein: alles auf einmal. */
export async function loadRoster(cfg: GraphConfig, f: Fetch = fetch): Promise<Roster> {
  const bearer = await token(cfg, f);
  const g = `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(cfg.groupId)}`;
  const [members, owners] = await Promise.all([
    ids(`${g}/transitiveMembers/microsoft.graph.user?$select=id&$top=999`, bearer, f),
    ids(`${g}/owners/microsoft.graph.user?$select=id&$top=999`, bearer, f),
  ]);
  return { members, owners };
}
