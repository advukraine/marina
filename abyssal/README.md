# ABYSSAL

A single-page, scroll-driven descent through the five layers of the open ocean.
The page darkens and changes character as you go down: the water interpolates
from surface cyan to trench black, the sunlight shafts fade out completely by
1000 m, and below that the only light is bioluminescent.

Vanilla HTML, CSS and JavaScript. No framework, no build step, no dependencies,
no image files — every piece of artwork is inline SVG or pure CSS.

```
abyssal/
├── index.html    five depth-zone sections, the eight silhouettes, the meter
├── styles.css    all styling and the scroll-driven motion
├── main.js       ES module: scroll mapping, depth meter, fallback motion
├── zones.js      zone data: name, depth range, palette, copy, SVG ids
└── README.md     this file
```

## Running it

**Open `index.html` in a browser.** Nothing needs installing and no server is
required; the page renders the full experience straight off the filesystem.

**One caveat, and it is a real one.** ES module scripts are fetched with CORS,
and a `file://` document has an opaque origin, so every browser refuses to load
them from disk. Rather than let that throw a CORS error into the console, the
bootstrap in `index.html` checks `location.protocol` and only requests
`main.js` over `http(s)`. Opened from disk the page therefore runs on CSS
alone — which is enough, because the water, the shafts, the reveals, the
parallax and even the counting depth readout are all CSS. What you lose from
disk is the JS fallback path, which only matters on a browser too old to
support scroll-driven animations in the first place.

To get the JavaScript path as well, serve the folder over HTTP:

```sh
cd abyssal
python3 -m http.server 8000     # then open http://localhost:8000
```

## How the descent is built

The whole thing hangs off one piece of geometry, and every keyframe percentage
in `styles.css` is derived from it rather than eyeballed:

```
hero 100svh + 5 zones x 180svh + colophon 100svh  =  1100svh document
scrollable range = 1100 - 100 (viewport)          =  1000svh
the reader's eye = middle of the viewport         =  scrollTop + 50svh

zone N top    -> (50 + 180(N-1)) / 1000  ->   5   23   41   59   77 %
zone N centre -> (180N - 40)     / 1000  ->  14   32   50   68   86 %
seafloor (11000 m)                       ->  95 %
```

So 41% of the scroll *is* 1000 m, which is where the light shafts reach zero.

**The colour hold.** Text contrast is the reason the water does not simply
interpolate from top to bottom. Each zone's colour is held flat for ±5% of
scroll either side of that zone's centre, and the interpolation happens only in
the gaps between zones. The zone text is fully opaque only inside that hold, so
the contrast ratio measured against the flat colour is the ratio the reader
actually gets. `main.js` rebuilds the same stop table from measured element
positions, so the fallback path renders the same water.

**The depth readout** is driven from JavaScript when it is available, because it
is measured from where the sections actually are rather than from assumed
heights. When it is not available, `styles.css` counts with a registered
`<integer>` custom property fed through a CSS counter. Pressure uses the
standard approximation for seawater: 1 atm at the surface, +1 atm per 10 m.

## Modern CSS used, and what happens without it

| Feature | What it does here | Support caveat |
| --- | --- | --- |
| **Scroll-driven animations** `animation-timeline: scroll()` / `view()` | The primary motion mechanism: water colour, shaft fade, dive progress, zone reveals, creature parallax | Chromium 115+, Safari 26+, Firefox 144+. Feature-detected with `CSS.supports`; anything that reports no support gets the IntersectionObserver + `requestAnimationFrame` path in `main.js` |
| **`@property`** | Registers `--sea-a/-b` (colour), `--dive`/`--shaft` (number) and `--depth-n`/`--press-n` (integer). Custom properties cannot be interpolated at all until they are registered with a type | Chromium 85+, Safari 16.4+, Firefox 128+. Without it the animations simply do not run and the base state — a readable page — stands |
| **`color-mix()`** | Palette interpolation: the frame scrim, the HUD panel translucency, the bioluminescent halos | Chromium 111+, Safari 16.2+, Firefox 113+. Where it is unsupported the declaration is dropped at parse time, so the scrim and panels lose their tint — the type underneath is unaffected and stays legible |
| **`clamp()`** | Fluid type throughout; zone titles run between exactly 3rem and 9rem | Chromium 79+, Safari 13.1+, Firefox 75+ — effectively universal now |
| **Container queries** `container-type: inline-size` + `@container` | `.zone__frame` re-typesets on its **own** inline size: a rule extends from the depth label at 46rem, and the body copy goes to two columns at 62rem | Chromium 105+, Safari 16+, Firefox 110+. Without them the frame stays in its single-column form, which is the mobile layout |
| **CSS counters from a registered integer** | The no-JavaScript depth and pressure readout: `counter-reset: depth var(--depth-n)` then `content: counter(depth)` | Needs `@property` plus scroll-driven animation. `main.js` switches it off (`html.js-active`) the moment it can write real text instead |
| **`overflow: clip`** | Keeps drifting silhouettes from widening the page. Deliberately not `hidden`: `hidden` would create a scroll container and become the scrollport that `view()` timelines resolve against, which would break every reveal | Chromium 90+, Firefox 81+, Safari 16+ |
| **`svh` units** | Section heights that do not jump when a mobile toolbar collapses | Chromium 108+, Safari 15.4+, Firefox 101+. A `vh` declaration precedes each one as the fallback |
| **Independent `rotate`** | Each light shaft keeps its angle while `transform` animates its sway, with no conflict | Chromium 104+, Safari 14.1+, Firefox 72+ |
| **`text-wrap: balance`** | Evens out the hero lede and the epigraphs | Chromium 114+, Safari 17.5+, Firefox 121+. Purely cosmetic |
| **`backdrop-filter`** | Frosts the depth meter and the zone rail | Broadly supported; the `-webkit-` prefix is included for older Safari. Without it the panels are simply more opaque |
| **`env(safe-area-inset-*)`** | Keeps the meter and rail clear of notches and home indicators | Ignored where unsupported; the `max()` wrapper supplies the floor |
| **SVG `feTurbulence`** | The full-viewport grain overlay, at 5% opacity and `pointer-events: none` | Part of SVG 1.1 filters; universal |

## Fonts

Two families, from Google Fonts: **Fraunces** (variable, `opsz 9..144`,
`wght 300..900`) for display, **JetBrains Mono** (variable) for every readout
and piece of metadata. Both are declared with a complete fallback stack
(`Iowan Old Style → Palatino → Georgia → serif`, and
`ui-monospace → SF Mono → Menlo → Consolas → monospace`), so the page still
reads as designed if the fonts never arrive. The stylesheet link is the only
external reference in the document.

The longest zone name, *Abyssopelagic*, was measured at the 3rem clamp floor:
it needs 274px in Fraunces and 258px in the fallback serif, and the 320px
layout gives it 304px. Below 30rem the frame drops its side padding and the
display type hangs slightly into the gutter to make that fit.

## On a phone

The two fixed instruments become edge strips rather than floating panels, and
every section reserves room for both, so neither can sit on the type.

- **Top:** the zone rail turns into a depth scale — `0 · 200 · 1000 · 4000 ·
  6000` — because a touch screen reports `(hover: none)` and would never fire
  the hover reveal the desktop rail uses. Without this the nav was five
  anonymous dots. The full zone name stays clipped-but-present in the
  accessibility tree, so each link still announces as *"Epipelagic 0–200 m"*.
- **Bottom:** the depth meter becomes a full-width readout strip with the dive
  progress as a hairline along its top edge. As a floating panel it covered the
  last two lines of body copy at 320×568.
- **Tap targets** are 44×44 minimum. They were 36×27.
- **`(pointer: coarse)`** drops two of the six light shafts, cuts the shaft
  blur from 22px to 12px, and removes `backdrop-filter` from both strips in
  favour of a more opaque background — a mobile GPU should not be asked to
  blur six full-height gradients behind a translucent panel.

Measured after the change on iPhone SE, iPhone 14 Pro, Pixel 7, a 360×640
Android and the 320×568 floor: no overlap anywhere, and the text block is
38–67% of the viewport (it was up to 94%).

The descent is about eleven screens of scrolling on a phone. That is the
design — five zones at 1.8 screens each — not an oversight.

## Accessibility

- Landmarks: `header`, labelled `nav`, `main`, `footer`, labelled `aside`.
  One `h1`; each zone is an `h2`; no level is skipped.
- All five zone links are keyboard reachable, after a skip link, and their
  accessible names carry the depth range. `aria-current` tracks the active zone.
- Every text colour clears WCAG AA (4.5:1) against its own zone background.
  This was measured from rendered pixels — water gradient, frame scrim and
  grain included — and the worst case anywhere on the page is 5.59:1.
- The eight silhouettes are `role="img"` with `<title>`; the grain overlay is
  `aria-hidden`.
- `prefers-reduced-motion: reduce` replaces every animation and transition with
  an instant state. Since the water can no longer change colour without its
  scroll timeline, each section then carries its own background — the same
  colours, so the same verified contrast. The depth meter keeps updating,
  because a readout changing as you scroll is content, not motion. Where
  reduced motion is set *and* no script is running, the meter is hidden rather
  than showing a frozen number that would be wrong; every zone prints its own
  depth range in the copy regardless.

## Verified

Checked in Chromium via Playwright, not by eye alone:

- No console errors from `file://` or over HTTP.
- Depth readout exact at every zone centre — 100, 600, 2500, 5000, 8500 m —
  and 11000 m / 1101 atm at the seafloor.
- Water colour at each zone centre is exactly the palette value, with the zone
  text at full opacity, on both the CSS and the JavaScript path.
- Light shafts measure 0.62 at the surface and exactly 0 at 1000 m.
- No horizontal scrollbar at 320, 360, 414, 768, 1024, 1440, 1920 or 2560px.
- Cumulative layout shift on load: 0.003.
- Reduced motion: zero running animations, all text at full opacity.
- On phone viewports: 44×44 tap targets, no overlap between the strips and the
  type, and every rail link keeps its accessible name in the a11y tree.
- Title descenders clear their taglines by 6px at the 3rem clamp floor and
  21px at full size (Fraunces descends ~0.25em, which `line-height: .9` does
  not cover).

Two things still want a human eye, because they are judgements rather than
measurements: how the motion actually *feels* at real scroll speeds, and
whether the page holds up in Safari and Firefox, whose scroll-timeline and
CSS-counter implementations were not available to test here.
