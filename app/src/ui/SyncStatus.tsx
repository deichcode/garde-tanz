/* Sync-Status, immer sichtbar (Design-System: .gm-status). */
import type { SyncInfo } from '../data/repo';
import { timeDE } from '../util';
import { Icon } from './Icon';

export function SyncStatus({ sync }: { sync: SyncInfo }) {
  switch (sync.state) {
    case 'local':
      return <span className="gm-status"><Icon name="cloud-off" />Vorschau · nur auf diesem Gerät</span>;
    case 'offline':
      return <span className="gm-status gm-status--error"><Icon name="cloud-off" />Offline – Änderungen sind auf dem Gerät gespeichert</span>;
    case 'syncing':
      return <span className="gm-status"><Icon name="sync" />Wird synchronisiert …</span>;
    default:
      return <span className="gm-status gm-status--ok"><Icon name="cloud" />Synchronisiert{sync.lastSyncedAt ? ` · ${timeDE(sync.lastSyncedAt)}` : ''}</span>;
  }
}
