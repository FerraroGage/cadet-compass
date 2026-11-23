<script lang="ts">
  // One ribbon as woven-fabric SVG, drawn on a 440 x 120 grid (the real 1 3/8 : 3/8 shape).
  // Stripe bands come from usmc-ribbons.json: [hexColor, widthFraction] left to right.
  // Without a sourced entry it draws a neutral placeholder (never invented colors).
  import spec from '../data/usmc-ribbons.json';
  type Entry = { bands: [string, number][]; device?: { type: 'cross' | 'star'; color: string } };
  let { name, width = 1.375, x, y, height, device }: { name: string; width?: number; x?: number; y?: number; height?: number; device?: { metal: string; shape: 'emblem' | 'lamp' | 'bar' } } = $props();
  const entry = $derived((spec.ribbons as unknown as Record<string, Entry>)[name]);
  const h = $derived(height ?? (width * 0.375) / 1.375);
  const W = 440, H = 120;
  const bands = $derived(entry?.bands ?? [['var(--line)', 0.15], ['var(--fill)', 0.7], ['var(--line)', 0.15]] as [string, number][]);
  const xs = $derived(bands.map((_, i) => bands.slice(0, i).reduce((s, b) => s + b[1], 0) * W));
  const star = Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 ? 0.4 : 1; return `${(r * Math.cos(a)).toFixed(3)},${(r * Math.sin(a)).toFixed(3)}`; }).join(' ');
  const cross = '-0.3,-1 0.3,-1 0.3,-0.3 1,-0.3 1,0.3 0.3,0.3 0.3,1 -0.3,1 -0.3,0.3 -1,0.3 -1,-0.3 -0.3,-0.3';
  const uid = $props.id();
  // Repeat-award device: the owner's photographed pins, one per metal. Each is a box [x, y, w, h] in its sheet; shown ~72 tall (60% of the ribbon).
  const pins: Record<string, { f: string; sw: number; sh: number; box: Record<string, number[]> }> = {
    emblem: { f: 'ega-pins.png', sw: 248, sh: 248, box: { bronze: [10, 60, 83, 91], silver: [157, 15, 81, 91], gold: [90, 133, 82, 93] } },
    lamp: { f: 'lamp-pins.png', sw: 401, sh: 398, box: { silver: [21, 58, 172, 115], gold: [215, 146, 181, 123], bronze: [68, 248, 170, 115] } }
  };
  const metals: Record<string, [string, string, string]> = { bronze: ['#f3c99a', '#c0773a', '#7a4318'], silver: ['#ffffff', '#c3c9d0', '#80888f'], gold: ['#fff0a6', '#e0ae2a', '#926a10'] };
  const dm = $derived(device ? metals[device.metal] : undefined);
  const base = import.meta.env.BASE_URL + 'img/devices/';
  const tex = import.meta.env.BASE_URL + 'img/textures/fabric.jpg';
  const D = 36; // bar device half-height
  const pin = $derived(device && device.shape !== 'bar' ? pins[device.shape === 'lamp' ? 'lamp' : 'emblem'] : undefined);
  const box = $derived(pin && device ? pin.box[device.metal] : undefined);
  const pw = $derived(box ? Math.min(100, (72 * box[2]) / box[3]) : 0);
  const ph = $derived(box ? (pw * box[3]) / box[2] : 0);
</script>

<svg {x} {y} {width} height={h} viewBox="0 0 {W} {H}" preserveAspectRatio="none" role="img" aria-label="{name} ribbon{entry ? '' : ', colors not confirmed'}">
  <title>{name}{entry ? '' : ' (colors not confirmed)'}</title>
  <defs>
    <linearGradient id="sh{uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.18" />
      <stop offset="0.3" stop-color="#fff" stop-opacity="0" />
      <stop offset="0.75" stop-color="#000" stop-opacity="0" />
      <stop offset="1" stop-color="#000" stop-opacity="0.12" />
    </linearGradient>
    <!-- Knit fabric photo, tiled; desaturated into light/shadow only (multiply darkens, screen lifts) so each stripe keeps its own color. -->
    <pattern id="fb{uid}" patternUnits="userSpaceOnUse" width="1400" height="1400"><image href={tex} width="1400" height="1400" preserveAspectRatio="none" /></pattern>
    <filter id="wm{uid}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0" /><feColorMatrix type="matrix" values="0.85 0 0 0 0.4  0.85 0 0 0 0.4  0.85 0 0 0 0.4  0 0 0 0 1" /></filter>
    <filter id="ws{uid}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0" /><feColorMatrix type="matrix" values="1.8 0 0 0 -0.7  1.8 0 0 0 -0.7  1.8 0 0 0 -0.7  0 0 0 0 1" /></filter>
    <radialGradient id="dv{uid}" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stop-color={dm?.[0]} /><stop offset="0.5" stop-color={dm?.[1]} /><stop offset="1" stop-color={dm?.[2]} /></radialGradient>
    <!-- White sheet background to alpha (luminance key), then close pin holes and trim the pale fringe. -->
    <filter id="kx{uid}" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -40 -40 -40 0 112" />
      <feMorphology operator="dilate" radius="2" result="d" />
      <feMorphology in="d" operator="erode" radius="2.5" />
    </filter>
    <filter id="ds{uid}" filterUnits="userSpaceOnUse" x="-80" y="-50" width="160" height="100"><feDropShadow dx="0.8" dy="1.2" stdDeviation="0.9" flood-color="#000" flood-opacity="0.45" /></filter>
  </defs>
  {#each bands as b, i}<rect x={xs[i]} y="0" width={b[1] * W + (i < bands.length - 1 ? 0.6 : 0)} height={H} fill={b[0]} shape-rendering="crispEdges" />{/each}
  <rect width={W} height={H} fill="url(#fb{uid})" filter="url(#wm{uid})" style="mix-blend-mode:multiply" />
  <rect width={W} height={H} fill="url(#fb{uid})" filter="url(#ws{uid})" style="mix-blend-mode:screen" opacity="0.3" />
  <rect width={W} height={H} fill="url(#sh{uid})" />
  {#if entry?.device}
    <g transform="translate({W / 2} {H / 2}) scale({entry.device.type === 'star' ? 30 : 26})">
      <polygon points={entry.device.type === 'star' ? star : cross} fill={entry.device.color} stroke="#000" stroke-opacity="0.45" stroke-width="0.06" />
    </g>
  {/if}
  {#if device && device.shape === 'bar'}
    <g transform="translate({W / 2} {H / 2})" fill="url(#dv{uid})" stroke="#000" stroke-opacity="0.6" stroke-width="1" vector-effect="non-scaling-stroke">
      <rect x={-D * 1.6} y={-D * 0.4} width={D * 3.2} height={D * 0.8} rx="3" vector-effect="non-scaling-stroke" />
    </g>
  {:else if pin && box}
    <g transform="translate({W / 2} {H / 2})" filter="url(#ds{uid})">
      <svg x={-pw / 2} y={-ph / 2} width={pw} height={ph} viewBox="{box[0]} {box[1]} {box[2]} {box[3]}"><image href={base + pin.f} width={pin.sw} height={pin.sh} filter="url(#kx{uid})" /></svg>
    </g>
  {/if}
  <rect x="0" y="0" width={W} height={H} fill="none" stroke="#000" stroke-opacity="0.32" stroke-width="1" vector-effect="non-scaling-stroke" shape-rendering="crispEdges" />
</svg>
