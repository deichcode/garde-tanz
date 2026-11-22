/* Server-Funktionen (Firebase, Region Frankfurt).
   - zugangPruefen: Blocking Function vor jeder Anmeldung. Nur Mitglieder und Besitzer der
     M365-Gruppe „Garde-Tanz“ kommen hinein; das Ergebnis steht als Claims im Token.
   - zugangAbgleichen: täglich. Wer aus der Gruppe entfernt wurde, verliert die Sitzung;
     die App löscht dann beim nächsten Online-Start ihre Daten auf dem Gerät. */
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions';
import { beforeUserSignedIn, HttpsError } from 'firebase-functions/identity';
import { logger } from 'firebase-functions';
import { defineSecret, defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/scheduler';
import { decide, msIdentity } from './access.js';
import { loadRoster, type GraphConfig } from './graph.js';

initializeApp();
setGlobalOptions({ region: 'europe-west3', maxInstances: 5 });

const MS_TENANT_ID = defineString('MS_TENANT_ID', { description: 'Verzeichnis-ID (Tenant-ID) des Vereins' });
const MS_CLIENT_ID = defineString('MS_CLIENT_ID', { description: 'Anwendungs-ID der App-Registrierung in Entra ID' });
const MS_GROUP_ID = defineString('MS_GROUP_ID', { description: 'Objekt-ID der M365-Gruppe „Garde-Tanz“' });
const MS_CLIENT_SECRET = defineSecret('MS_CLIENT_SECRET');

const graph = (): GraphConfig => ({
  tenantId: MS_TENANT_ID.value(),
  clientId: MS_CLIENT_ID.value(),
  clientSecret: MS_CLIENT_SECRET.value(),
  groupId: MS_GROUP_ID.value(),
});

export const zugangPruefen = beforeUserSignedIn({ idToken: true, secrets: [MS_CLIENT_SECRET] }, async (event) => {
  const user = event.data;
  if (!user) throw new HttpsError('invalid-argument', 'NO_USER');
  if (event.credential?.providerId !== 'microsoft.com' && event.additionalUserInfo?.providerId !== 'microsoft.com') {
    throw new HttpsError('permission-denied', 'NOT_MEMBER');
  }
  const { oid, tid } = msIdentity(event);
  if (tid && tid !== MS_TENANT_ID.value()) throw new HttpsError('permission-denied', 'WRONG_TENANT');
  if (!oid) {
    logger.error('Keine Microsoft-Objekt-ID im Anmelde-Ereignis', { uid: user.uid });
    throw new HttpsError('permission-denied', 'NOT_MEMBER');
  }
  const access = decide(await loadRoster(graph()), oid);
  if (!access.member) {
    logger.info('Anmeldung abgelehnt: nicht in der Gruppe', { uid: user.uid });
    throw new HttpsError('permission-denied', 'NOT_MEMBER');
  }
  // Gespeichert wird nur Name, E-Mail und die Microsoft-Konto-ID (Konzept 6.1)
  await getFirestore()
    .doc(`users/${user.uid}`)
    .set(
      { name: user.displayName ?? user.email ?? 'Trainer', email: user.email ?? '', msId: oid, checkedAt: FieldValue.serverTimestamp(), removedAt: FieldValue.delete() },
      { merge: true },
    );
  return { customClaims: { member: true, admin: access.admin } };
});

export const zugangAbgleichen = onSchedule(
  { schedule: 'every day 04:17', timeZone: 'Europe/Berlin', secrets: [MS_CLIENT_SECRET], retryCount: 2 },
  async () => {
    const roster = await loadRoster(graph());
    const auth = getAuth();
    const users = await getFirestore().collection('users').get();
    let removed = 0;
    for (const doc of users.docs) {
      const msId = doc.get('msId') as string | undefined;
      if (!msId || doc.get('removedAt')) continue;
      const access = decide(roster, msId);
      try {
        if (!access.member) {
          await auth.setCustomUserClaims(doc.id, { member: false, admin: false });
          await auth.revokeRefreshTokens(doc.id); // Sitzung endet beim nächsten Online-Abgleich
          await doc.ref.set({ removedAt: FieldValue.serverTimestamp() }, { merge: true });
          removed++;
        } else {
          const current = (await auth.getUser(doc.id)).customClaims ?? {};
          if (current.admin !== access.admin || current.member !== true) await auth.setCustomUserClaims(doc.id, { member: true, admin: access.admin });
          await doc.ref.set({ checkedAt: FieldValue.serverTimestamp() }, { merge: true });
        }
      } catch (e) {
        logger.error('Abgleich fehlgeschlagen', { uid: doc.id, error: String(e) });
      }
    }
    logger.info('Zugang abgeglichen', { geprueft: users.size, entfernt: removed });
  },
);
