/* Sicherheitsregeln (firestore.rules) im Emulator: npm run test:rules (braucht Java). */
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collectionGroup, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'garde-tanz-test',
    firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
afterAll(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'teams/t1'), { name: 'Junioren', order: 0 });
    await setDoc(doc(db, 'dances/d1'), { teamId: 't1', title: 'Gardetanz', frameOrder: ['f1'], updatedBy: 'anna' });
    await setDoc(doc(db, 'dances/d1/frames/f1'), { counts: 8, updatedBy: 'anna' });
    await setDoc(doc(db, 'users/anna'), { name: 'Anna', email: 'anna@verein.de', msId: 'x' });
    await setDoc(doc(db, 'roles/reserve'), { name: 'Reserve' });
  });
});

const trainer = () => env.authenticatedContext('anna', { member: true, admin: false }).firestore();
const leitung = () => env.authenticatedContext('chef', { member: true, admin: true }).firestore();
const fremd = () => env.authenticatedContext('fremd', {}).firestore();
const entfernt = () => env.authenticatedContext('ben', { member: false, admin: false }).firestore();
const anonym = () => env.unauthenticatedContext().firestore();

describe('Zugang nur für die Gruppe „Garde-Tanz“', () => {
  it('Trainer lesen alles, auch alle Bilder auf einmal', async () => {
    await assertSucceeds(getDoc(doc(trainer(), 'dances/d1')));
    await assertSucceeds(getDoc(doc(trainer(), 'dances/d1/frames/f1')));
    await assertSucceeds(getDocs(collectionGroup(trainer(), 'frames')));
    await assertSucceeds(getDoc(doc(trainer(), 'users/anna')));
  });

  it('ohne Anmeldung, ohne Gruppe oder nach dem Entfernen: nichts', async () => {
    for (const db of [anonym(), fremd(), entfernt()]) {
      await assertFails(getDoc(doc(db, 'dances/d1')));
      await assertFails(getDoc(doc(db, 'dances/d1/frames/f1')));
      await assertFails(getDocs(collectionGroup(db, 'frames')));
      await assertFails(getDoc(doc(db, 'teams/t1')));
      await assertFails(getDoc(doc(db, 'users/anna')));
      await assertFails(setDoc(doc(db, 'dances/d2'), { title: 'x', updatedBy: 'fremd' }));
    }
  });
});

describe('Alle Trainer dürfen alles, mit zwei Ausnahmen', () => {
  it('Bilder und Tänze ändern, mit dem eigenen Namen als „zuletzt geändert von“', async () => {
    await assertSucceeds(updateDoc(doc(trainer(), 'dances/d1/frames/f1'), { counts: 16, updatedBy: 'anna' }));
    await assertFails(updateDoc(doc(trainer(), 'dances/d1/frames/f1'), { counts: 16, updatedBy: 'jemand-anders' }));
    await assertSucceeds(setDoc(doc(trainer(), 'dances/d2'), { title: 'Neu', updatedBy: 'anna' }));
    await assertSucceeds(deleteDoc(doc(trainer(), 'dances/d1/frames/f1')));
  });

  it('Garden legt nur die Trainerleitung an', async () => {
    await assertFails(setDoc(doc(trainer(), 'teams/t2'), { name: 'Senioren', order: 1 }));
    await assertSucceeds(setDoc(doc(leitung(), 'teams/t2'), { name: 'Senioren', order: 1 }));
  });

  it('Kataloge pflegen alle, Rollen löschen nur die Trainerleitung', async () => {
    await assertSucceeds(setDoc(doc(trainer(), 'roleActions/reserve~schmei%C3%9F'), { roleId: 'reserve', label: 'Schmeiß' }));
    await assertFails(deleteDoc(doc(trainer(), 'roles/reserve')));
    await assertSucceeds(deleteDoc(doc(leitung(), 'roles/reserve')));
  });

  it('Trainer-Daten schreibt nur der Server', async () => {
    await assertFails(setDoc(doc(trainer(), 'users/anna'), { name: 'Anna B.' }));
    await assertFails(setDoc(doc(leitung(), 'users/neu'), { name: 'Neu' }));
  });
});
