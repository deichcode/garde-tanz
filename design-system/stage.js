/* =============================================================================
   Gardemaß – Bühnen-Renderer (Referenz)
   Zeichnet Bühne, Gruppensymbole, Formationen und Laufwege als SVG.
   Zugleich Referenz für „Form → Einzelpositionen“ (layoutFormation).

   Koordinaten: normiert 0..1. x = links→rechts, y = hinten→vorne (y = 1 ist die
   Bühnenvorderkante, Publikum unten). Bühne fest 3:2.
   ============================================================================= */
(function (global) {
  'use strict';

  var W = 300, H = 200, PAD = 6;   // Bühne 3:2 in SVG-Einheiten
  var R = 4.6;                     // Symbolradius ≈ 3 % der Bühnenbreite
  var MIN_MOVE = 6;                // kleinere Bewegungen bekommen keinen Pfeil
  var uid = 0;

  /* --- Symbole ------------------------------------------------------------ */
  function symbol(shape, x, y, r) {
    var t = 'translate(' + f(x) + ' ' + f(y) + ')';
    switch (shape) {
      case 'dot': return '<circle class="gm-dancer--dot" cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '"/>';
      case 'ring': return '<circle class="gm-dancer--ring" cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r - 1.1) + '"/>';
      case 'cross': var c = r * 0.82;
        return '<path class="gm-dancer--cross" transform="' + t + '" d="M' + -c + ' ' + -c + 'L' + c + ' ' + c + 'M' + c + ' ' + -c + 'L' + -c + ' ' + c + '"/>';
      case 'triangle': return '<path class="gm-dancer--triangle" transform="' + t + '" d="M0 ' + f(-r * 1.15) + 'L' + f(r * 1.05) + ' ' + f(r * 0.8) + 'H' + f(-r * 1.05) + 'Z"/>';
      case 'square': var s = r * 0.88;
        return '<rect class="gm-dancer--square" x="' + f(x - s) + '" y="' + f(y - s) + '" width="' + f(2 * s) + '" height="' + f(2 * s) + '"/>';
      case 'diamond': var d = r * 1.25;
        return '<path class="gm-dancer--diamond" transform="' + t + '" d="M0 ' + -d + 'L' + d + ' 0L0 ' + d + 'L' + -d + ' 0Z"/>';
      default: // Buchstabe, z. B. { letter: "R" }
        return '<text class="gm-dancer--letter" x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" dominant-baseline="central">' + esc(shape.letter || '?') + '</text>';
    }
  }

  /** Kleines Inline-Symbol für Aktionszeilen und Legenden. */
  function symbolIcon(shape, label) {
    return '<svg viewBox="-6 -6 12 12" role="img" aria-label="' + esc(label || '') + '">' + symbol(shape, 0, 0, R) + '</svg>';
  }

  /* --- Form → Einzelpositionen ------------------------------------------- */
  function layoutFormation(fm) {
    var n = fm.members.length, pts = [], i;
    var cx = fm.cx * W, cy = fm.cy * H;
    switch (fm.shape) {
      case 'line': {
        var L = (fm.length || 0.6) * W;
        for (i = 0; i < n; i++) pts.push([n === 1 ? 0 : (i / (n - 1) - 0.5) * L, 0]);
        break;
      }
      case 'block': {
        var rows = fm.rows || 2, cols = Math.ceil(n / rows);
        var BW = (fm.length || 0.3) * W, gy = (fm.depth || 0.14) * H;
        for (i = 0; i < n; i++) {
          var r = Math.floor(i / cols), k = i % cols;
          var inRow = Math.min(cols, n - r * cols);
          var sx = cols > 1 ? BW / (cols - 1) : 0;
          pts.push([(k - (inRow - 1) / 2) * sx, (r - (rows - 1) / 2) * gy]);
        }
        break;
      }
      case 'circle': {
        var rad = (fm.radius || 0.3) * H;
        for (i = 0; i < n; i++) {
          var a = (-90 + (360 * i) / n) * Math.PI / 180;
          pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
        }
        break;
      }
      case 'arc': { // Bogen, Mitte zeigt zum Publikum
        var ra = (fm.radius || 0.3) * H, sp = fm.spread || 120;
        for (i = 0; i < n; i++) {
          var b = (90 - sp / 2 + (n === 1 ? sp / 2 : (sp * i) / (n - 1))) * Math.PI / 180;
          pts.push([Math.cos(b) * ra, Math.sin(b) * ra]);
        }
        break;
      }
      case 'wedge': { // Keil, Spitze zeigt zum Publikum
        var half = ((fm.spread || 70) / 2) * Math.PI / 180, step = (fm.spacing || 0.07) * W;
        for (i = 0; i < n; i++) {
          var arm = Math.ceil(i / 2), side = i % 2 ? -1 : 1;
          pts.push([side * Math.sin(half) * arm * step, -Math.cos(half) * arm * step]);
        }
        break;
      }
      default: // frei
        return fm.members.map(function (m, j) {
          return { key: m, x: fm.points[j][0] * W, y: fm.points[j][1] * H };
        });
    }
    var rot = ((fm.rotation || 0) * Math.PI) / 180, cs = Math.cos(rot), sn = Math.sin(rot);
    return pts.map(function (p, j) {
      return { key: fm.members[j], x: cx + p[0] * cs - p[1] * sn, y: cy + p[0] * sn + p[1] * cs };
    });
  }

  function positions(frame) {
    var map = {};
    frame.formations.forEach(function (fm, fi) {
      layoutFormation(fm).forEach(function (p) {
        var o = fm.overrides && fm.overrides[p.key];
        map[p.key] = { x: o ? o[0] * W : p.x, y: o ? o[1] * H : p.y, fi: fi };
      });
    });
    return map;
  }

  /* --- Laufwege ------------------------------------------------------------ */
  function centroid(list) {
    var x = 0, y = 0;
    list.forEach(function (p) { x += p.x; y += p.y; });
    return { x: x / list.length, y: y / list.length };
  }

  function arrow(a, b, bend, cls, markerId) {
    var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    if (len < MIN_MOVE) return '';
    var mx = (a.x + b.x) / 2 - (dy / len) * (bend || 0) * len;
    var my = (a.y + b.y) / 2 + (dx / len) * (bend || 0) * len;
    var s = trim(a, { x: mx, y: my }, R + 3), e = trim(b, { x: mx, y: my }, R + 4);
    return '<path class="gm-path ' + cls + '" marker-end="url(#' + markerId + ')" d="M' + f(s.x + PAD) + ' ' + f(s.y + PAD) +
      'Q' + f(mx + PAD) + ' ' + f(my + PAD) + ' ' + f(e.x + PAD) + ' ' + f(e.y + PAD) + '"/>';
  }

  function trim(p, toward, d) {
    var dx = toward.x - p.x, dy = toward.y - p.y, l = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / l) * d, y: p.y + (dy / l) * d };
  }

  function paths(frame, next, markerId) {
    if (!next) return '';
    var P = positions(frame), Q = positions(next), out = '';
    frame.formations.forEach(function (fm, fi) {
      // 'auto' (Standard) | 'group' | 'individual'
      var mode = (frame.pathMode && frame.pathMode[fi]) || 'auto';
      var bend = (frame.bend && frame.bend[fi]) || 0;
      var single = function (ms) {
        ms.forEach(function (m) { out += arrow(P[m], Q[m], bend, 'gm-path--individual', markerId); });
      };
      var moving = fm.members.filter(function (m) { return Q[m]; });
      if (mode === 'individual') { single(moving); return; }

      // Sagt ein Pfeil vom Schwerpunkt zum Schwerpunkt etwas aus? Nicht, wenn sich
      // der Schwerpunkt kaum bewegt, die Einzelnen aber deutlich (Umformieren am Platz).
      var test = function (ms) {
        var a = centroid(ms.map(function (m) { return P[m]; })), b = centroid(ms.map(function (m) { return Q[m]; }));
        var avg = ms.reduce(function (s, m) { return s + Math.hypot(P[m].x - Q[m].x, P[m].y - Q[m].y); }, 0) / ms.length;
        return { a: a, b: b, ok: avg < MIN_MOVE * 2 || Math.hypot(b.x - a.x, b.y - a.y) >= 0.4 * avg };
      };

      // Stufe 1: ein Pfeil pro Formation bzw. Gruppenverbund und Ziel-Formation
      var subsets = {};
      moving.forEach(function (m) { (subsets[Q[m].fi] = subsets[Q[m].fi] || []).push(m); });
      Object.keys(subsets).forEach(function (k) {
        var ms = subsets[k], r = test(ms);
        if (mode === 'group' || r.ok) { out += arrow(r.a, r.b, bend, '', markerId); return; }
        // Stufe 2: Verbund trennt sich → ein Pfeil pro Gruppe
        var byGroup = {};
        ms.forEach(function (m) { var g = m.split(':')[0]; (byGroup[g] = byGroup[g] || []).push(m); });
        Object.keys(byGroup).forEach(function (g) {
          var r2 = test(byGroup[g]);
          // Stufe 3: Gruppe formiert sich am Platz um → Einzelwege
          if (r2.ok) out += arrow(r2.a, r2.b, bend, '', markerId); else single(byGroup[g]);
        });
      });
    });
    return out;
  }

  /* --- Zuordnung: wer läuft wohin? ------------------------------------------- */
  /**
   * Ordnet die Tänzer jeder Gruppe den Plätzen im nächsten Bild so zu, dass die
   * Summe der Wege minimal ist. Minimale Summe gerader Wege heißt auch: keine
   * Kreuzungen innerhalb der Gruppe. Referenz per Durchprobieren (≤ 8 Tänzer),
   * in der App: Ungarische Methode.
   */
  function assignShortest(prev, next) {
    var P = positions(prev), out = JSON.parse(JSON.stringify(next)), slotsByGroup = {};
    out.formations.forEach(function (fm, fi) {
      layoutFormation(fm).forEach(function (p, si) {
        var g = fm.members[si].split(':')[0];
        (slotsByGroup[g] = slotsByGroup[g] || []).push({ fi: fi, si: si, x: p.x, y: p.y, key: fm.members[si] });
      });
    });
    Object.keys(slotsByGroup).forEach(function (g) {
      var slots = slotsByGroup[g];
      var dancers = slots.map(function (s) { return s.key; }).filter(function (k) { return P[k]; });
      if (dancers.length !== slots.length || slots.length > 8) return;
      var best = dancers, bestCost = Infinity;
      permute(dancers, function (perm) {
        var c = 0;
        for (var i = 0; i < perm.length; i++) {
          c += Math.hypot(P[perm[i]].x - slots[i].x, P[perm[i]].y - slots[i].y);
          if (c >= bestCost) return;
        }
        bestCost = c; best = perm.slice();
      });
      slots.forEach(function (s, i) { out.formations[s.fi].members[s.si] = best[i]; });
    });
    return out;
  }

  function permute(arr, cb) { // Heap-Algorithmus
    var a = arr.slice(), n = a.length, c = [], i = 0, j, t;
    for (j = 0; j < n; j++) c.push(0);
    cb(a);
    while (i < n) {
      if (c[i] < i) {
        j = i % 2 ? c[i] : 0; t = a[j]; a[j] = a[i]; a[i] = t;
        cb(a); c[i]++; i = 0;
      } else { c[i] = 0; i++; }
    }
  }

  /* --- Bühne --------------------------------------------------------------- */
  /**
   * opts: { label: bool, ghost: Frame (KI-Vorschlag), selected: Index der Formation,
   *         guides: [{x1,y1,x2,y2}] normiert, title: string }
   */
  function renderStage(dance, frame, next, opts) {
    opts = opts || {};
    var id = 'gm' + (++uid), sym = symbolMap(dance);
    var vbH = opts.label ? 226 : 212;
    var svg = '<svg class="gm-stage" viewBox="0 0 ' + (W + 2 * PAD) + ' ' + vbH + '" role="img" aria-label="' + esc(opts.title || 'Bühne') + '">';
    svg += '<defs>' + marker(id + 'a', 'gm-path__head') + marker(id + 'g', 'gm-path__head gm-path__head--ghost') + '</defs>';
    svg += '<rect class="gm-stage__floor" x="' + PAD + '" y="' + PAD + '" width="' + W + '" height="' + H + '"/>';
    svg += '<line class="gm-stage__front" x1="' + PAD + '" y1="' + (PAD + H) + '" x2="' + (PAD + W) + '" y2="' + (PAD + H) + '"/>';
    if (opts.label) svg += '<text class="gm-stage__label" x="' + (PAD + W / 2) + '" y="' + (vbH - 3) + '" text-anchor="middle">PUBLIKUM</text>';
    (opts.guides || []).forEach(function (g) {
      svg += '<line class="gm-stage__guide" x1="' + f(PAD + g.x1 * W) + '" y1="' + f(PAD + g.y1 * H) + '" x2="' + f(PAD + g.x2 * W) + '" y2="' + f(PAD + g.y2 * H) + '"/>';
    });

    svg += '<g class="' + (opts.ghost ? 'is-faded' : '') + '">' + paths(frame, opts.ghost ? null : next, id + 'a') + dancers(frame, sym) + '</g>';
    if (opts.ghost) svg += '<g class="is-ghost">' + paths(frame, opts.ghost, id + 'g') + dancers(opts.ghost, sym) + '</g>';
    if (opts.selected != null) svg += selection(frame.formations[opts.selected]);
    return svg + '</svg>';
  }

  function dancers(frame, sym) {
    var P = positions(frame), out = '';
    Object.keys(P).forEach(function (k) {
      out += symbol(sym[k.split(':')[0]], P[k].x + PAD, P[k].y + PAD, R);
    });
    return out;
  }

  function selection(fm) {
    var pts = layoutFormation(fm), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, m = R + 5;
    pts.forEach(function (p) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
    x0 += PAD - m; y0 += PAD - m; x1 += PAD + m; y1 += PAD + m;
    var h = function (x, y) { return '<rect class="gm-sel__handle" x="' + f(x - 3.5) + '" y="' + f(y - 3.5) + '" width="7" height="7"/>'; };
    return '<g><rect class="gm-sel" x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(x1 - x0) + '" height="' + f(y1 - y0) + '"/>' +
      '<line class="gm-sel" x1="' + f((x0 + x1) / 2) + '" y1="' + f(y0) + '" x2="' + f((x0 + x1) / 2) + '" y2="' + f(y0 - 12) + '"/>' +
      '<circle class="gm-sel__handle" cx="' + f((x0 + x1) / 2) + '" cy="' + f(y0 - 14) + '" r="4"/>' +
      h(x0, y0) + h(x1, y0) + h(x0, y1) + h(x1, y1) + '</g>';
  }

  function marker(id, cls) {
    return '<marker id="' + id + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">' +
      '<path class="' + cls + '" d="M0 0L10 5L0 10Z"/></marker>';
  }

  /* --- Aktionen ------------------------------------------------------------ */
  function trackSum(t) { return t.blocks.reduce(function (s, b) { return s + b[0]; }, 0); }
  function trackText(t) { return t.blocks.map(function (b) { return b[0] + ' ' + b[1]; }).join(' · '); }
  /** Wie trackText, aber die Anzahl Zeiten fett in Mono, damit „2 1/4 Dreh“ eindeutig bleibt. */
  function trackHtml(t) {
    return t.blocks.map(function (b) { return '<b class="gm-track__n">' + b[0] + '</b> ' + esc(b[1]); }).join(' · ');
  }
  function trackWho(dance, t) {
    return t.groups.map(function (g) {
      var gr = group(dance, g);
      return symbolIcon(gr.symbol, gr.name);
    }).join('');
  }

  /** Warnungen nach den Prüfregeln (Konzept 5.3). */
  function warnings(frame, next) {
    var list = [], P = positions(frame), Q = next ? positions(next) : null;
    frame.tracks.forEach(function (t, ti) {
      var sum = trackSum(t);
      if (sum !== frame.counts) list.push({ track: ti, kind: 'sum', text: sum + ' von ' + frame.counts + ' Zeiten belegt' });
      if (Q) {
        var moved = Object.keys(P).some(function (k) {
          return t.groups.indexOf(k.split(':')[0]) > -1 && Q[k] && Math.hypot(P[k].x - Q[k].x, P[k].y - Q[k].y) >= MIN_MOVE;
        });
        var hasMove = t.blocks.some(function (b) { return b[2]; });
        if (moved && !hasMove) list.push({ track: ti, kind: 'move', text: 'läuft ins nächste Bild, aber keine Lauf-Aktion' });
      }
    });
    return list;
  }

  function renderFrame(dance, frame, next, opts) {
    opts = opts || {};
    var warns = warnings(frame, next);
    var cls = 'gm-frame' + (opts.active ? ' is-active' : '') + (opts.now ? ' is-now' : '');
    var html = '<article class="' + cls + '" aria-label="Bild ' + frame.num + '">';
    html += '<header class="gm-frame__head"><span class="gm-frame__num">' + frame.num + '</span>' +
      '<span class="gm-frame__counts">' + frame.counts + ' Zeiten</span><span class="gm-frame__flags">';
    if (warns.length) html += '<span class="gm-badge gm-badge--warn" title="Offene Hinweise">' + icon('warn') + warns.length + '</span>';
    if (frame.note) html += '<span class="gm-badge gm-badge--neutral" title="Notiz">' + icon('note') + '</span>';
    html += '</span></header>';
    html += '<div class="gm-frame__stage">' + renderStage(dance, frame, next, { label: !!opts.label, title: 'Bild ' + frame.num }) + '</div>';
    html += '<ul class="gm-frame__tracks">';
    frame.tracks.forEach(function (t, ti) {
      var bad = warns.some(function (w) { return w.track === ti && w.kind === 'sum'; });
      var sum = trackSum(t);
      html += '<li class="gm-track' + (bad ? ' has-warning' : '') + '"><span class="gm-track__who">' + trackWho(dance, t) + '</span>' +
        '<span class="gm-track__text">' + trackHtml(t) + '</span>' +
        '<span class="gm-track__sum">' + (bad || opts.sums ? sum + '/' + frame.counts : '') + '</span></li>';
    });
    return html + '</ul></article>';
  }

  /** Aktionen als Bausteine (Inspektor, Training). opts.at = aktuelle Zeit (1-basiert). */
  function renderChips(t, opts) {
    opts = opts || {};
    var pos = 0, html = '';
    t.blocks.forEach(function (b) {
      var from = pos + 1, to = pos + b[0];
      pos = to;
      var state = '';
      if (opts.at != null) state = opts.at > to ? ' gm-chip--past' : opts.at >= from ? ' gm-chip--now' : '';
      var style = state === ' gm-chip--now' ? ' style="--gm-progress:' + Math.round(((opts.at - from + 1) / b[0]) * 100) + '%"' : '';
      html += '<span class="gm-chip' + (opts.size ? ' gm-chip--' + opts.size : '') + state + '"' + style + '>' +
        '<span class="gm-chip__n">' + b[0] + '</span> ' + esc(b[1]) + (b[2] ? icon('move', 'bewegend') : '') + '</span>';
    });
    return html;
  }

  /* --- Hilfen ---------------------------------------------------------------- */
  function icon(name, label) {
    return '<svg class="gm-icon" aria-hidden="' + (label ? 'false' : 'true') + '"' + (label ? ' role="img" aria-label="' + esc(label) + '"' : '') +
      '><use href="#i-' + name + '"/></svg>';
  }
  function group(dance, id) { return dance.groups.filter(function (g) { return g.id === id; })[0]; }
  function symbolMap(dance) { var m = {}; dance.groups.forEach(function (g) { m[g.id] = g.symbol; }); return m; }
  function f(n) { return Math.round(n * 10) / 10; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /** Mitglieder-Helfer: members('a', 6) → ["a:0" … "a:5"]; alternate('a','b',6) → ●○●○… */
  function members(g, n) { var a = []; for (var i = 0; i < n; i++) a.push(g + ':' + i); return a; }
  function alternate(g1, g2, n) { var a = []; for (var i = 0; i < n; i++) a.push(g1 + ':' + i, g2 + ':' + i); return a; }

  global.GM = {
    symbol: symbol, symbolIcon: symbolIcon, layoutFormation: layoutFormation, positions: positions, assignShortest: assignShortest,
    renderStage: renderStage, renderFrame: renderFrame, renderChips: renderChips, warnings: warnings,
    trackText: trackText, trackHtml: trackHtml, trackSum: trackSum, trackWho: trackWho, icon: icon, members: members, alternate: alternate
  };
})(window);
