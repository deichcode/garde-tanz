/** Zufällige ID wie bei Firestore: 20 Zeichen, auch offline eindeutig. */
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let id = '';
  for (const b of bytes) id += ABC[b % ABC.length];
  return id;
}
