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
  // Repeat-award device: [highlight, body, shadow] per metal, about 60% of the ribbon height.
  const metals: Record<string, [string, string, string]> = { bronze: ['#f3c99a', '#c0773a', '#7a4318'], silver: ['#ffffff', '#c3c9d0', '#80888f'], gold: ['#fff0a6', '#e0ae2a', '#926a10'] };
  const dm = $derived(device ? metals[device.metal] : undefined);
  const D = 36; // device half-height
  // The owner's black-on-white device art, used as a silhouette mask: file, art center (cx, cy), image size, shape width in the image (bw), size on the ribbon (w, h).
  const base = import.meta.env.BASE_URL + 'img/devices/';
  const art = { emblem: { f: 'ega.png', cx: 188, cy: 177, aw: 376, ah: 354, bw: 376, w: 76, h: 72 }, lamp: { f: 'lamp.jpg', cx: 115, cy: 120, aw: 225, ah: 225, bw: 200, w: 130, h: 78 } };
  const dev = $derived(device && device.shape !== 'bar' ? art[device.shape] : undefined);
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
    <!-- Grosgrain weave: horizontal ribs + fine thread grain, grayscale, lifted so it only varies the light a little. -->
    <filter id="wv{uid}" filterUnits="userSpaceOnUse" x="0" y="0" width={W} height={H} color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03 0.85" numOctaves="1" seed="3" result="rib" />
      <feTurbulence type="fractalNoise" baseFrequency="0.7 0.7" numOctaves="1" seed="9" result="grain" />
      <feComposite in="rib" in2="grain" operator="arithmetic" k2="0.7" k3="0.3" result="n" />
      <feColorMatrix in="n" type="matrix" values="1.3 1.3 1.3  0 -0.95  1.3 1.3 1.3  0 -0.95  1.3 1.3 1.3  0 -0.95  0 0 0 0 1" />
    </filter>
    <radialGradient id="dv{uid}" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stop-color={dm?.[0]} /><stop offset="0.5" stop-color={dm?.[1]} /><stop offset="1" stop-color={dm?.[2]} /></radialGradient>
    {#if dev}
      <!-- Invert the black-on-white art and push it to hard black/white, so the shape (not the page) shows through. -->
      <filter id="iv{uid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="-3 0 0 0 2  0 -3 0 0 2  0 0 -3 0 2  0 0 0 1 0" /></filter>
      <mask id="dm{uid}" maskUnits="userSpaceOnUse" x="-100" y="-60" width="200" height="120">
        <g transform="scale({dev.w / dev.bw}) translate({-dev.cx} {-dev.cy})"><image href={base + dev.f} width={dev.aw} height={dev.ah} filter="url(#iv{uid})" /></g>
      </mask>
    {/if}
    <radialGradient id="dh{uid}" cx="0.35" cy="0.3" r="0.6"><stop offset="0" stop-color="#fff" stop-opacity="0.65" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></radialGradient>
  </defs>
  {#each bands as b, i}<rect x={xs[i]} y="0" width={b[1] * W + (i < bands.length - 1 ? 0.6 : 0)} height={H} fill={b[0]} shape-rendering="crispEdges" />{/each}
  <rect width={W} height={H} filter="url(#wv{uid})" style="mix-blend-mode:multiply" opacity="0.5" />
  <rect width={W} height={H} fill="url(#sh{uid})" />
  {#if entry?.device}
    <g transform="translate({W / 2} {H / 2}) scale({entry.device.type === 'star' ? 30 : 26})">
      <polygon points={entry.device.type === 'star' ? star : cross} fill={entry.device.color} stroke="#000" stroke-opacity="0.45" stroke-width="0.06" />
    </g>
  {/if}
  {#if device && dm}
    <g transform="translate({W / 2} {H / 2})" fill="url(#dv{uid})" stroke="#000" stroke-opacity="0.6" stroke-width="1" vector-effect="non-scaling-stroke">
      {#if dev}
        <!-- Darker copy offset underneath = the edge; metal gradient through the mask; soft highlight on top. -->
        <rect x={-dev.w / 2} y={-dev.h / 2} width={dev.w} height={dev.h} mask="url(#dm{uid})" fill={dm[2]} stroke="none" transform="translate(0.9 1.2)" />
        <rect x={-dev.w / 2} y={-dev.h / 2} width={dev.w} height={dev.h} mask="url(#dm{uid})" stroke="none" />
        <rect x={-dev.w / 2} y={-dev.h / 2} width={dev.w} height={dev.h} mask="url(#dm{uid})" fill="url(#dh{uid})" stroke="none" />
      {:else}
        <rect x={-D * 1.6} y={-D * 0.4} width={D * 3.2} height={D * 0.8} rx="3" vector-effect="non-scaling-stroke" />
      {/if}
    </g>
  {/if}
  <rect x="0" y="0" width={W} height={H} fill="none" stroke="#000" stroke-opacity="0.32" stroke-width="1" vector-effect="non-scaling-stroke" shape-rendering="crispEdges" />
</svg>
