<script lang="ts">
  // One ribbon as woven-fabric SVG, drawn on a 440 x 120 grid (the real 1 3/8 : 3/8 shape).
  // Stripe bands come from usmc-ribbons.json: [hexColor, widthFraction] left to right.
  // Without a sourced entry it draws a neutral placeholder (never invented colors).
  import { LAMP } from './RankInsignia.svelte';
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
      {#if device.shape === 'emblem'}
        <g transform="scale(0.72)" stroke-linejoin="round">
          <path d="M-4.5 -20H4.5V46H-4.5ZM-26 -21H26V-13H-26ZM-36 14L-27 17Q-16 38 0 38Q16 38 27 17L36 14Q36 50 0 52Q-36 50 -36 14Z" vector-effect="non-scaling-stroke" />
          <circle cy="6" r="18" vector-effect="non-scaling-stroke" />
          <path d="M-5 -38H5L6 -22H-6ZM1 -49Q8 -49 9 -45L14 -43L8 -41Q7 -39 3 -39L-4 -39Q-5 -48 1 -49ZM-4 -36Q-22 -52 -50 -42L-42 -36L-48 -30L-38 -28L-40 -22L-24 -24L-4 -22ZM4 -36Q22 -52 50 -42L42 -36L48 -30L38 -28L40 -22L24 -24L4 -22Z" vector-effect="non-scaling-stroke" />
          <path d="M-18 6H18M0 -12V24M-9 -10Q-14 6 -9 22M9 -10Q14 6 9 22" fill="none" stroke-opacity="0.55" vector-effect="non-scaling-stroke" />
          <path d="M-26 -13Q-40 12 -22 30M26 -13Q40 12 22 30" fill="none" stroke-width="2" stroke-opacity="0.55" vector-effect="non-scaling-stroke" />
        </g>
      {:else if device.shape === 'lamp'}
        <g transform="scale(4.2) translate(-0.5 -0.2)" stroke-linejoin="round">{#each LAMP as d}<path {d} fill-rule="evenodd" vector-effect="non-scaling-stroke" />{/each}</g>
      {:else}
        <rect x={-D * 1.6} y={-D * 0.4} width={D * 3.2} height={D * 0.8} rx="3" vector-effect="non-scaling-stroke" />
      {/if}
    </g>
  {/if}
  <rect x="0" y="0" width={W} height={H} fill="none" stroke="#000" stroke-opacity="0.32" stroke-width="1" vector-effect="non-scaling-stroke" shape-rendering="crispEdges" />
</svg>
