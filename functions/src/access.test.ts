import { describe, expect, it } from 'vitest';
import { decide, jwtPayload, msIdentity } from './access.js';
import { loadRoster } from './graph.js';

const roster = { members: new Set(['m1', 'm2']), owners: new Set(['o1']) };
const jwt = (payload: object) => ['x', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'sig'].join('.');

describe('Zugang', () => {
  it('Mitglieder dürfen, Besitzer sind Admins, alle anderen nicht', () => {
    expect(decide(roster, 'm1')).toEqual({ member: true, admin: false });
    expect(decide(roster, 'o1')).toEqual({ member: true, admin: true });
    expect(decide(roster, 'x')).toEqual({ member: false, admin: false });
  });

  it('Microsoft-Identität aus den Claims, dem ID-Token oder dem Profil', () => {
    expect(msIdentity({ credential: { claims: { oid: 'a', tid: 't' } } })).toEqual({ oid: 'a', tid: 't' });
    expect(msIdentity({ credential: { idToken: jwt({ oid: 'b', tid: 't2' }) } })).toEqual({ oid: 'b', tid: 't2' });
    expect(msIdentity({ additionalUserInfo: { profile: { id: 'c' } } })).toEqual({ oid: 'c', tid: null });
    expect(msIdentity({})).toEqual({ oid: null, tid: null });
    expect(jwtPayload('kaputt')).toBeNull();
  });
});

describe('Graph', () => {
  it('liest Mitglieder über mehrere Seiten und die Besitzer', async () => {
    const calls: string[] = [];
    const fake = (async (url: string | URL) => {
      const u = String(url);
      calls.push(u);
      const json = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;
      if (u.includes('/token')) return json({ access_token: 'T' });
      if (u.includes('/owners/')) return json({ value: [{ id: 'o1' }] });
      if (u.includes('seite2')) return json({ value: [{ id: 'm3' }] });
      return json({ value: [{ id: 'm1' }, { id: 'm2' }], '@odata.nextLink': 'https://graph.microsoft.com/v1.0/seite2' });
    }) as typeof fetch;
    const r = await loadRoster({ tenantId: 'tn', clientId: 'c', clientSecret: 's', groupId: 'g' }, fake);
    expect([...r.members]).toEqual(['m1', 'm2', 'm3']);
    expect([...r.owners]).toEqual(['o1']);
    expect(calls[0]).toBe('https://login.microsoftonline.com/tn/oauth2/v2.0/token');
    expect(calls.some((c) => c.includes('/groups/g/transitiveMembers/microsoft.graph.user'))).toBe(true);
  });

  it('meldet Fehler von Graph, statt still alle abzulehnen', async () => {
    const fake = (async (url: string | URL) =>
      String(url).includes('/token') ? ({ ok: true, json: async () => ({ access_token: 'T' }) } as Response) : ({ ok: false, status: 403 } as Response)) as typeof fetch;
    await expect(loadRoster({ tenantId: 't', clientId: 'c', clientSecret: 's', groupId: 'g' }, fake)).rejects.toThrow('HTTP 403');
  });
});
