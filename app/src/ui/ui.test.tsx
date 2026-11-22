import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { defaultGroups, firstFrame } from '../domain/factory';
import type { Frame } from '../domain/types';
import { FrameCard } from './FrameCard';
import { Stage } from './Stage';

const groups = defaultGroups();
const dance = { groups };

describe('Bildkarte', () => {
  it('zeigt „Alle“, Teil, Zusatz und Wiederholung wie auf Papier', () => {
    const f: Frame = {
      ...firstFrame(groups, 'u', 'jetzt'),
      counts: 16,
      tracks: [
        { groupIds: ['g1'], members: ['g1:0', 'g1:1', 'g1:2'], label: 'linke Reihe', blocks: [{ repeat: 2, blocks: [{ counts: 2, term: 'GewSchw', moves: false }, { counts: 2, term: 'Klopf', moves: false }] }, { counts: 8, term: 'Marsch', moves: true, detail: 'zur Mitte' }] },
        { groupIds: ['g1', 'g2', 'g3'], members: undefined, blocks: [{ counts: 16, term: 'Stip', moves: false }] },
      ],
    };
    const html = renderToStaticMarkup(<FrameCard dance={dance} frame={f} num={14} />);
    expect(html).toContain('linke Reihe');
    expect(html).toContain('>Alle<');
    expect(html).toContain('<span class="gm-track__detail">zur Mitte</span>');
    expect(html).toMatch(/‖:.*GewSchw.*Klopf.*:‖.*×2/);
    expect(html).toContain('16 Zeiten<'); // Spuren mit unterschiedlichem Aufbau: in Achtern gezählt
  });

  it('markiert leere Spuren und zeigt die Zahl der Hinweise', () => {
    const html = renderToStaticMarkup(<FrameCard dance={dance} frame={firstFrame(groups, 'u', 'jetzt')} num={1} />);
    expect(html.match(/class="gm-track__empty"/g)).toHaveLength(3);
    expect(html).toMatch(/gm-badge--warn[^>]*>.*3<\/span>/);
  });
});

describe('Bühne', () => {
  it('zeichnet jeden Tänzer genau einmal, mit Symbol seiner Gruppe', () => {
    const html = renderToStaticMarkup(<Stage dance={dance} frame={firstFrame(groups, 'u', 'jetzt')} title="Bild 1" label />);
    expect(html.match(/gm-dancer--dot/g)).toHaveLength(6);
    expect(html.match(/gm-dancer--ring/g)).toHaveLength(6);
    expect(html.match(/gm-dancer--cross/g)).toHaveLength(4);
    expect(html).toContain('PUBLIKUM');
  });
});
