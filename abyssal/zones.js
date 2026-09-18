/**
 * ABYSSAL — zone data.
 *
 * Single source of truth for the five pelagic zones: identity, depth range,
 * palette, editorial copy and the ids of the creature silhouettes drawn in
 * each zone. main.js imports this; index.html mirrors the copy as static
 * markup so the page reads correctly before (or without) any script.
 *
 * `sea` is the colour at the top of the fixed water gradient and `seaDeep`
 * the colour at its bottom; both are mirrored by @keyframes sea-shift so the
 * scroll-driven path and the JS fallback render the same water.
 *
 * Palette contrast was computed against WCAG 2.1 relative luminance. Every
 * ink value below clears 4.5:1 against its own `sea` colour; the backdrop
 * animation deliberately HOLDS each `sea` colour across the band of scroll
 * where that zone's text is on screen, so the measured ratio is the ratio
 * the reader actually gets.
 */

/** Seawater pressure, standard approximation: 1 atm at the surface, +1 atm per 10 m. */
export const ATM_PER_METRE = 1 / 10;

/** Deepest point the meter reads, in metres (the floor of the hadal zone). */
export const MAX_DEPTH = 11000;

export const ZONES = [
  {
    id: 'epipelagic',
    name: 'Epipelagic',
    tagline: 'The Sunlit Zone',
    from: 0,
    to: 200,
    palette: {
      sea: '#7fd4e8',
      seaDeep: '#5ec0dc',
      ink: '#05222e',
      meta: '#0c3f52',
      epigraph: '#0a3546',
      life: '#0a3546',
      accent: null
    },
    epigraph: 'Where the sea still remembers the sky.',
    copy:
      'Sunlight reaches this far and no further with any real strength. ' +
      'Phytoplankton drift here in numbers beyond counting, turning light into ' +
      'the first link of almost every food chain in the sea. The water is warm, ' +
      "wind-stirred and blue. Nearly all of the ocean's photosynthesis, and most " +
      'of the fish anyone has ever seen, belong to this thin bright skin.',
    svg: ['sil-moon-jelly', 'sil-school']
  },
  {
    id: 'mesopelagic',
    name: 'Mesopelagic',
    tagline: 'The Twilight Zone',
    from: 200,
    to: 1000,
    palette: {
      sea: '#0d3a52',
      seaDeep: '#092b3f',
      ink: '#e4f4fa',
      meta: '#b4d6e3',
      epigraph: '#bfe0ec',
      life: '#2d6d8c',
      accent: null
    },
    epigraph: 'The last blue light, and the first living light.',
    copy:
      'Light thins to a blue rumour here: enough to see by, never enough to grow ' +
      'by. Temperature falls away through the thermocline and the colour drains ' +
      'out of everything. Each night an enormous population of lanternfish, squid ' +
      'and shrimp rises toward the surface to feed, then sinks again before dawn — ' +
      'the largest migration of animals on Earth, repeated daily.',
    svg: ['sil-lanternfish', 'sil-squid']
  },
  {
    id: 'bathypelagic',
    name: 'Bathypelagic',
    tagline: 'The Midnight Zone',
    from: 1000,
    to: 4000,
    palette: {
      sea: '#061c2c',
      seaDeep: '#04121e',
      ink: '#dff0f7',
      meta: '#8fb3c4',
      epigraph: '#b6d8e6',
      life: '#1b4a63',
      accent: '#7ef9d2'
    },
    epigraph: 'No sunlight has ever reached this far.',
    copy:
      'Beyond a thousand metres the sun is simply gone, and no amount of waiting ' +
      'will bring it back. The water sits a few degrees above freezing; the ' +
      'pressure has already passed a hundred atmospheres. Food arrives from above ' +
      'as marine snow. What light exists is made by the animals themselves — an ' +
      "anglerfish's lure, the flare of a startled jelly.",
    svg: ['sil-anglerfish', 'sil-gulper-eel']
  },
  {
    id: 'abyssopelagic',
    name: 'Abyssopelagic',
    tagline: 'The Abyss',
    from: 4000,
    to: 6000,
    palette: {
      sea: '#020a12',
      seaDeep: '#01060c',
      ink: '#d8ecf4',
      meta: '#88aabb',
      epigraph: '#aed2e1',
      life: '#153b52',
      accent: '#b28dff'
    },
    epigraph: 'The ocean’s true condition: cold, dark and enormous.',
    copy:
      'Much of the seafloor lies at these depths: flat abyssal plains under ' +
      'kilometres of black water, close to freezing, and never anything but dark. ' +
      'Life here is sparse and unhurried — it waits, it scavenges, it spends ' +
      'energy carefully. Above the sediment, dumbo octopuses row along on ear-like ' +
      'fins, the deepest-living octopuses known to us.',
    svg: ['sil-dumbo']
  },
  {
    id: 'hadal',
    name: 'Hadal',
    tagline: 'The Trenches',
    from: 6000,
    to: 11000,
    palette: {
      sea: '#000206',
      seaDeep: '#000104',
      ink: '#d2e8f2',
      meta: '#82a5b6',
      epigraph: '#a8cddd',
      life: '#123448',
      accent: '#7ef9d2'
    },
    epigraph: 'Named for Hades. Found only in trenches.',
    copy:
      'Below six thousand metres the ocean stops being a basin and becomes a set ' +
      'of trenches: narrow, steep, and cut off from one another. At the bottom of ' +
      'the deepest of them the pressure passes a thousand atmospheres. Snailfish ' +
      'and swarms of amphipods live there anyway, in the deepest water anyone has ' +
      'reached.',
    svg: ['sil-snailfish']
  }
];

/**
 * Depth in metres for a point inside a zone, given 0..1 progress through it.
 * Kept here so the meter and the zone boundaries can never disagree.
 */
export function depthAt(zoneIndex, progress) {
  const zone = ZONES[zoneIndex];
  const t = Math.min(1, Math.max(0, progress));
  return zone.from + (zone.to - zone.from) * t;
}

/** Pressure in atmospheres at a given depth, using ATM_PER_METRE. */
export function pressureAt(depthMetres) {
  return 1 + depthMetres * ATM_PER_METRE;
}
