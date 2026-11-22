/* Icon-Satz aus design-system/index.html: 24er Raster, 2 px Strich, runde Enden.
   Erzeugt aus dem Styleguide, Änderungen dort machen und neu übernehmen. */
export type IconName = 'play' | 'pause' | 'prev' | 'next' | 'down' | 'warn' | 'check' | 'cloud' | 'cloud-off' | 'sync' | 'ready' | 'edit' | 'plus' | 'minus' | 'spark' | 'print' | 'grid' | 'move' | 'undo' | 'note' | 'music' | 'play-o' | 'trash';

const SPRITE = `<symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12z"/></symbol>
<symbol id="i-pause" viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></symbol>
<symbol id="i-prev" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></symbol>
<symbol id="i-next" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></symbol>
<symbol id="i-down" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
<symbol id="i-warn" viewBox="0 0 24 24"><path d="M12 3.8L2.6 20h18.8z"/><path d="M12 10v4.2"/><path d="M12 17.3v.2"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
<symbol id="i-cloud" viewBox="0 0 24 24"><path d="M7 18.5h10.2a4 4 0 0 0 .4-8 6 6 0 0 0-11.4-1.2A4.6 4.6 0 0 0 7 18.5z"/><path d="M9.5 13.8l2 2 3.6-3.6"/></symbol>
<symbol id="i-cloud-off" viewBox="0 0 24 24"><path d="M7 18.5h10.2a4 4 0 0 0 .4-8 6 6 0 0 0-11.4-1.2A4.6 4.6 0 0 0 7 18.5z"/><path d="M3 3l18 18"/></symbol>
<symbol id="i-sync" viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-14.3 4.9"/><path d="M4 12A8 8 0 0 1 18.3 7.1"/><path d="M18.5 3v4.3h-4.3"/><path d="M5.5 21v-4.3h4.3"/></symbol>
<symbol id="i-ready" viewBox="0 0 24 24"><path d="M12 3.5v11"/><path d="M7.5 10.5l4.5 4.5 4.5-4.5"/><path d="M4.5 20h15"/></symbol>
<symbol id="i-edit" viewBox="0 0 24 24"><path d="M4 20h4L19.5 8.5l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
<symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
<symbol id="i-spark" viewBox="0 0 24 24"><path d="M11 3l1.9 5.6L18.5 10.5l-5.6 1.9L11 18l-1.9-5.6L3.5 10.5l5.6-1.9z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></symbol>
<symbol id="i-print" viewBox="0 0 24 24"><path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="1.5"/><path d="M7 14h10v6.5H7z"/></symbol>
<symbol id="i-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></symbol>
<symbol id="i-move" viewBox="0 0 24 24"><path d="M4 12h15"/><path d="M14 6.5l5.5 5.5-5.5 5.5"/></symbol>
<symbol id="i-undo" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></symbol>
<symbol id="i-note" viewBox="0 0 24 24"><path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5"/><path d="M8.5 9h7M8.5 12.5h4"/></symbol>
<symbol id="i-music" viewBox="0 0 24 24"><path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></symbol>
<symbol id="i-play-o" viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12z"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M4.5 7h15"/><path d="M9.5 7V4.5h5V7"/><path d="M6.5 7l1 13h9l1-13"/></symbol>`;

/** Einmal pro Seite einbinden. */
export function IconSprite() {
  return <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE }} />;
}

/** Icon aus dem Satz. Mit label ist es beschreibend, sonst rein dekorativ. */
export function Icon({ name, label }: { name: IconName; label?: string }) {
  return (
    <svg className="gm-icon" aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label}>
      <use href={`#i-${name}`} />
    </svg>
  );
}
