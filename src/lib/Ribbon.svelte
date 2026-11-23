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
  const art = { emblem: { f: 'ega.png', cx: 188, cy: 177, aw: 376, ah: 354, bw: 376, w: 76, h: 72 } };
  const tex = import.meta.env.BASE_URL + 'img/textures/fabric.jpg';
  const lampPin = import.meta.env.BASE_URL + 'img/devices/lamp-bronze.png';
  const lampF = $derived(device?.metal === 'silver' ? `url(#ms${uid})` : device?.metal === 'gold' ? `url(#mg${uid})` : undefined);
  const dev = $derived(device && device.shape === 'emblem' ? art[device.shape] : undefined);
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
    <filter id="ms{uid}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0" /><feColorMatrix type="matrix" values="1.3 0 0 0 0.12  0 1.35 0 0 0.14  0 0 1.45 0 0.16  0 0 0 1 0" /></filter>
    <filter id="mg{uid}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="1.8" /><feColorMatrix type="matrix" values="1.1 0.5 0 0 0.06  0.2 1.3 0 0 0.06  0 0 0.5 0 0  0 0 0 1 0" /></filter>
    <filter id="iv2{uid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="-5 0 0 0 3.6  0 -5 0 0 3.6  0 0 -5 0 3.6  0 0 0 1 0" /></filter>
    <radialGradient id="dv{uid}" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stop-color={dm?.[0]} /><stop offset="0.5" stop-color={dm?.[1]} /><stop offset="1" stop-color={dm?.[2]} /></radialGradient>
    {#if dev}
      <!-- Invert the black-on-white art and push it to hard black/white, so the shape (not the page) shows through. -->
      <filter id="iv{uid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="-3 0 0 0 2  0 -3 0 0 2  0 0 -3 0 2  0 0 0 1 0" /></filter>
      <mask id="dm{uid}" maskUnits="userSpaceOnUse" x="-100" y="-60" width="200" height="120">
        <g transform="scale({dev.w / dev.bw}) translate({-dev.cx} {-dev.cy})"><image href={base + dev.f} width={dev.aw} height={dev.ah} filter="url(#iv{uid})" /></g>
      </mask>
    {/if}
    <!-- Stamped-metal lighting: the silhouette's blurred alpha is the bump map (light from upper left); box is the device area only. -->
    {#if device}
      <filter id="lt{uid}" filterUnits="userSpaceOnUse" x="-75" y="-45" width="150" height="90" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b" />
        <feDiffuseLighting in="b" surfaceScale="4" diffuseConstant="1.25" lighting-color="#fff" result="d"><feDistantLight azimuth="225" elevation="50" /></feDiffuseLighting>
        <feComposite in="d" in2="SourceGraphic" operator="arithmetic" k1="1" result="m" />
        <feSpecularLighting in="b" surfaceScale="4" specularConstant="1" specularExponent="25" lighting-color="#fff" result="sp"><feDistantLight azimuth="225" elevation="50" /></feSpecularLighting>
        <feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2" />
        <feComposite in="m" in2="sp2" operator="arithmetic" k2="1" k3="0.8" result="lit" />
        <feComposite in="lit" in2="SourceAlpha" operator="in" result="litc" />
        <feDropShadow in="litc" dx="0.8" dy="1.2" stdDeviation="0.9" flood-color="#000" flood-opacity="0.45" />
      </filter>
      <filter id="ls{uid}" filterUnits="userSpaceOnUse" x="-75" y="-45" width="150" height="90" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b" />
        <feSpecularLighting in="b" surfaceScale="4" specularConstant="0.9" specularExponent="25" lighting-color="#fff" result="sp"><feDistantLight azimuth="225" elevation="50" /></feSpecularLighting>
        <feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2" />
        <feComposite in="SourceGraphic" in2="sp2" operator="arithmetic" k2="1" k3="0.7" result="lit" />
        <feComposite in="lit" in2="SourceAlpha" operator="in" result="litc" />
        <feDropShadow in="litc" dx="0.8" dy="1.2" stdDeviation="0.9" flood-color="#000" flood-opacity="0.45" />
      </filter>
    {/if}
    <radialGradient id="dh{uid}" cx="0.35" cy="0.3" r="0.6"><stop offset="0" stop-color="#fff" stop-opacity="0.65" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></radialGradient>
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
  {#if device && dm}
    <g transform="translate({W / 2} {H / 2})" fill="url(#dv{uid})" stroke="#000" stroke-opacity="0.6" stroke-width="1" vector-effect="non-scaling-stroke">
      {#if dev}
        <g filter="url(#lt{uid})"><rect x={-dev.w / 2} y={-dev.h / 2} width={dev.w} height={dev.h} mask="url(#dm{uid})" stroke="none" /></g>
      {:else if device.shape === 'lamp'}
        <!-- Bronze pin photo (white background keyed out by its own luminance), recolored per metal; 72 tall like the other devices. -->
        <mask id="lm{uid}" maskUnits="userSpaceOnUse" x="-100" y="-60" width="200" height="120">
          <g transform="scale(0.3956) translate(-140 -179)"><image href={lampPin} width="280" height="360" filter="url(#iv2{uid})" /></g>
        </mask>
        <g filter="url(#ls{uid})"><g mask="url(#lm{uid})"><g transform="scale(0.3956) translate(-140 -179)"><image href={lampPin} width="280" height="360" filter={lampF} /></g></g></g>
      {:else}
        <rect x={-D * 1.6} y={-D * 0.4} width={D * 3.2} height={D * 0.8} rx="3" vector-effect="non-scaling-stroke" />
      {/if}
    </g>
  {/if}
  <rect x="0" y="0" width={W} height={H} fill="none" stroke="#000" stroke-opacity="0.32" stroke-width="1" vector-effect="non-scaling-stroke" shape-rendering="crispEdges" />
</svg>
