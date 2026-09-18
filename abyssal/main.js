/**
 * ABYSSAL — scroll and depth-meter logic.
 *
 * Two motion paths, chosen once at load:
 *
 *   1. CSS scroll-driven animations carry the water colour, the light shafts,
 *      the reveals and the creature parallax. Nothing here drives them.
 *   2. Where `animation-timeline` is unsupported, this module reproduces the
 *      same motion with IntersectionObserver plus a requestAnimationFrame
 *      loop, mirroring the keyframes in styles.css.
 *
 * The depth readout is driven from here on both paths, because it is measured
 * from where the sections actually are rather than from assumed heights. The
 * CSS counters in styles.css cover the case where this module never loads.
 */

import { ZONES, MAX_DEPTH, depthAt, pressureAt } from './zones.js';

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hasScrollTimeline = CSS.supports('animation-timeline', 'scroll()');

/** Half-width of each zone's colour hold, as a fraction of total scroll.
 *  Mirrors the +/-5% holds in @keyframes sea-shift. */
const COLOUR_HOLD = 0.05;
/** Light-shaft opacity ramp; the 1000 m stop is derived from the DOM below. */
const SHAFT_START = 0.62;
const SHAFT_MID = 0.3;

const meterZoneEl = document.querySelector('[data-meter-zone]');
const meterDepthEl = document.querySelector('[data-meter-depth]');
const meterPressureEl = document.querySelector('[data-meter-pressure]');
const seaEl = document.querySelector('.sea');
const shaftsEl = document.querySelector('.shafts');
const heroEl = document.querySelector('.hero');
const railLinks = Array.from(document.querySelectorAll('.rail__link'));

/* --- geometry ------------------------------------------------------------- */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const lerp = (a, b, t) => a + (b - a) * t;

/** One measured band of the document per zone, plus the creatures inside it. */
const bands = ZONES.map((zone, index) => {
  const el = document.getElementById(`zone-${zone.id}`);
  if (!el) return null;
  // zone.svg names the silhouettes this zone owns; resolve them through it so
  // the data file stays the thing that decides what lives where.
  const creatures = zone.svg
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .map((svg) => svg.closest('.creature'))
    .filter(Boolean);
  return {
    zone,
    index,
    el,
    creatures,
    link: railLinks.find((a) => a.getAttribute('href') === `#zone-${zone.id}`) || null,
    top: 0,
    height: 1
  };
}).filter(Boolean);

let maxScroll = 1;

function measure() {
  const y = window.scrollY;
  for (const band of bands) {
    const rect = band.el.getBoundingClientRect();
    band.top = rect.top + y;
    band.height = Math.max(1, rect.height);
  }
  maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
}

/** Scroll progress at which a document position sits at the viewport middle. */
const progressForDocumentY = (docY) =>
  clamp((docY - window.innerHeight / 2) / maxScroll, 0, 1);

/* --- depth ---------------------------------------------------------------- */

/** Index of the band under the reader's eye, clamped to the ends of the dive. */
function bandIndexAt(probe) {
  if (!bands.length) return 0;
  if (probe < bands[0].top) return 0;
  for (let i = bands.length - 1; i >= 0; i -= 1) {
    if (probe >= bands[i].top) return i;
  }
  return 0;
}

function depthAtProbe(probe) {
  if (!bands.length) return 0;
  const last = bands[bands.length - 1];
  if (probe <= bands[0].top) return 0;
  if (probe >= last.top + last.height) return MAX_DEPTH;
  const i = bandIndexAt(probe);
  return depthAt(i, (probe - bands[i].top) / bands[i].height);
}

/* --- colour --------------------------------------------------------------- */

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbString = (a, b, t) =>
  `rgb(${Math.round(lerp(a[0], b[0], t))} ${Math.round(lerp(a[1], b[1], t))} ${Math.round(lerp(a[2], b[2], t))})`;

/**
 * Colour stops in scroll-progress space, rebuilt whenever the page is measured.
 * Each zone contributes a flat hold around its centre; the interpolation only
 * ever happens in the gaps between zones, which is what keeps the text
 * contrast equal to the measured ratio for that zone's flat colour.
 */
let seaStops = [];

function buildSeaStops() {
  seaStops = [];
  bands.forEach((band, i) => {
    const centre = progressForDocumentY(band.top + band.height / 2);
    const start = i === 0 ? 0 : centre - COLOUR_HOLD;
    const end = i === bands.length - 1 ? 1 : centre + COLOUR_HOLD;
    const stop = {
      a: toRgb(band.zone.palette.sea),
      b: toRgb(band.zone.palette.seaDeep)
    };
    seaStops.push({ p: start, ...stop }, { p: end, ...stop });
  });
}

function seaColoursAt(progress) {
  if (!seaStops.length) return null;
  if (progress <= seaStops[0].p) return seaStops[0];
  for (let i = 1; i < seaStops.length; i += 1) {
    const to = seaStops[i];
    if (progress <= to.p) {
      const from = seaStops[i - 1];
      const span = to.p - from.p;
      const t = span > 0 ? (progress - from.p) / span : 0;
      return { a: rgbString(from.a, to.a, t), b: rgbString(from.b, to.b, t) };
    }
  }
  const lastStop = seaStops[seaStops.length - 1];
  return { a: rgbString(lastStop.a, lastStop.a, 0), b: rgbString(lastStop.b, lastStop.b, 0) };
}

const asColour = (value) => (Array.isArray(value) ? rgbString(value, value, 0) : value);

/** Progress at which the last sunlight is gone: the top of the 1000 m zone. */
function darknessProgress() {
  const bathypelagic = bands.find((b) => b.zone.from === 1000);
  return bathypelagic ? progressForDocumentY(bathypelagic.top) : 0.41;
}

function shaftOpacityAt(progress) {
  const dark = darknessProgress();
  const mid = dark * 0.49;
  if (progress >= dark) return 0;
  if (progress <= mid) return lerp(SHAFT_START, SHAFT_MID, mid > 0 ? progress / mid : 0);
  return lerp(SHAFT_MID, 0, (progress - mid) / (dark - mid));
}

/* --- the frame loop ------------------------------------------------------- */

let lastDepth = null;
let lastBand = null;

function render() {
  const progress = clamp(window.scrollY / maxScroll, 0, 1);
  const probe = window.scrollY + window.innerHeight / 2;
  const depth = depthAtProbe(probe);
  const index = bandIndexAt(probe);

  const metres = Math.round(depth);
  if (metres !== lastDepth) {
    lastDepth = metres;
    if (meterDepthEl) meterDepthEl.textContent = String(metres);
    if (meterPressureEl) meterPressureEl.textContent = String(Math.round(pressureAt(depth)));
  }
  if (index !== lastBand) {
    lastBand = index;
    if (meterZoneEl) meterZoneEl.textContent = bands[index].zone.name;
    for (const band of bands) {
      if (!band.link) continue;
      if (band.index === index) band.link.setAttribute('aria-current', 'true');
      else band.link.removeAttribute('aria-current');
    }
  }

  if (hasScrollTimeline) return;          // CSS already owns everything below

  root.style.setProperty('--dive', String(progress));

  const colours = seaColoursAt(progress);
  if (seaEl && colours) {
    seaEl.style.setProperty('--sea-a', asColour(colours.a));
    seaEl.style.setProperty('--sea-b', asColour(colours.b));
  }
  if (shaftsEl) shaftsEl.style.setProperty('--shaft', String(shaftOpacityAt(progress)));

  if (reduceMotion.matches) return;       // no parallax, no fades

  if (heroEl) {
    const gone = clamp(progress / 0.16, 0, 1);
    heroEl.style.opacity = String(1 - gone);
    heroEl.style.transform = `translateY(${-14 * gone}%)`;
  }
  const viewport = window.innerHeight;
  for (const band of bands) {
    for (const creature of band.creatures) {
      const rect = creature.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewport) continue;
      const pass = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
      creature.style.setProperty('--par', `${(0.5 - pass) * 32}%`);
    }
  }
}

let queued = false;
function onScroll() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    render();
  });
}

/* --- fallback reveals ----------------------------------------------------- */

let observer = null;

function setUpReveals() {
  const targets = Array.from(document.querySelectorAll('.zone__frame, .creature'));
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (hasScrollTimeline) return;
  if (reduceMotion.matches) {
    // Reduced motion: the same end state, arrived at instantly.
    for (const target of targets) {
      target.classList.add('is-in');
      target.style.removeProperty('--par');
    }
    if (heroEl) {
      heroEl.style.removeProperty('opacity');
      heroEl.style.removeProperty('transform');
    }
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.target.classList.toggle('is-in', entry.isIntersecting);
    },
    { rootMargin: '-10% 0px -10% 0px' }
  );
  for (const target of targets) observer.observe(target);
}

/* --- start ---------------------------------------------------------------- */

function refresh() {
  measure();
  buildSeaStops();
  lastDepth = null;
  lastBand = null;
  render();
}

refresh();
setUpReveals();

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', refresh, { passive: true });
window.addEventListener('load', refresh);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(refresh).catch(() => {});
}
reduceMotion.addEventListener('change', () => {
  setUpReveals();
  refresh();
});

// Tells the bootstrap in index.html that the enhanced path is live, so it will
// not roll the page back to its always-readable base state.
root.classList.add('main-ready');
