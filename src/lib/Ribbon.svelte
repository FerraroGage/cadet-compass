<script lang="ts">
  // One ribbon as woven-fabric SVG, drawn on a 440 x 120 grid (the real 1 3/8 : 3/8 shape).
  // Stripe bands come from usmc-ribbons.json: [hexColor, widthFraction] left to right.
  // Without a sourced entry it draws a neutral placeholder (never invented colors).
  import { LAMP, LAMP_HI, LAMP_SH } from './RankInsignia.svelte';
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
  // Eagle, globe and anchor on a ~96 x 95 grid, globe centered at (0, 8). Right-side wing parts mirror the left (absolute M/L/C/Q only).
  const mirror = (d: string) => d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, px, py) => `${-px} ${py}`);
  const WING = 'M-4 -32C-12 -44 -26 -48.5 -48 -50.5L-42.5 -45.5Q-46 -45 -47.5 -42L-40 -39.5Q-43.5 -38.5 -44.5 -35L-36 -33.5Q-39 -32 -39.5 -28L-30.5 -28.5Q-33 -26.5 -32.5 -22.5L-24.5 -25Q-26 -23.5 -25.5 -19.5L-18 -22.5Q-19 -21 -17.5 -17Q-12 -19.5 -11 -19.5L-5 -21Z';
  const WING_LN = 'M-7 -28.5C-15 -35.5 -27 -40.5 -41 -45.5M-40 -39.5L-38.5 -44.5M-36 -33.5L-33 -42.5M-30.5 -28.5L-27 -39.5M-24.5 -25L-20 -37M-18 -22.5L-14 -34M-11 -20L-9 -30.5';
  const WING_HI = 'M-6 -32.5C-13 -41 -26 -46 -45 -49.5';
  const EGA = {
    shank: 'M-3 -16H3L3.6 40H-3.6Z',
    arms: 'M0 44C-15 44 -27 37 -30 25L-38.5 24Q-37 15 -33 9Q-27.5 13.5 -22.5 20L-25.5 26C-21 33 -12 37 0 37C12 37 21 33 25.5 26L22.5 20Q27.5 13.5 33 9Q37 15 38.5 24L30 25C27 37 15 44 0 44Z',
    stock: 'M-29 -13.5H29C31 -13.5 32.2 -12.6 32.2 -11.5C32.2 -10.4 31 -9.5 29 -9.5H-29C-31 -9.5 -32.2 -10.4 -32.2 -11.5C-32.2 -12.6 -31 -13.5 -29 -13.5Z',
    rope: 'M-20 -14C-24 -16.5 -28.5 -14.5 -27 -10C-32 -4 -32.5 4 -29 13C-25 24 -14 31 -3 31.5C3 31.8 5.5 33.5 4 35.5C2.5 37.2 -1.5 36 -0.5 34C1 31.5 10 30.5 17 27C21 25 23.5 22 24.5 19',
    grid: 'M-22 8H22M-19.05 -3Q0 0 19.05 -3M-19.05 19Q0 22 19.05 19M-12.6 -10Q0 -8 12.6 -10M-12.6 26Q0 28 12.6 26M0 -14V30M0 -14C-10.7 -14 -10.7 30 0 30M0 -14C10.7 -14 10.7 30 0 30M0 -14C-20.7 -14 -20.7 30 0 30M0 -14C20.7 -14 20.7 30 0 30',
    land: 'M-16 -9C-12 -13 -4 -14 2 -12C6 -11 10 -9 9 -6C7 -4 4 -4 3 -1C2 2 0 3 -1 5C-2 6 -3 8 -1 10C0 11 2 12 3 12.5C1 13 -2 11 -4 9C-7 6 -9 3 -11 1C-13 -1 -15 -3 -18 -4C-19 -6 -18 -8 -16 -9ZM3.5 12.5C6 11.5 10 12 13 14C16 16 16 18 14 20C11.5 22.5 9.5 25 7.5 27.5C6.5 28.5 5.8 27.5 6 26C6.2 23.5 4 20 3 17C2.2 15 2.2 13.5 3.5 12.5ZM6 -13C9 -14.5 12 -12.5 11 -10.5C10 -8.5 7 -9 6 -11Z',
    body: 'M-6 -35C-9.5 -29 -9.5 -21 -6.5 -16L-8.5 -12L-5.5 -13L-4.5 -11.3L-2.5 -13H2.5L4.5 -11.3L5.5 -13L8.5 -12L6.5 -16C9.5 -21 9.5 -29 6 -35Z',
    chest: 'M-4.5 -29Q0 -25.5 4.5 -29M-4 -23.5Q0 -20 4 -23.5',
    scroll: 'M-8 -41C-13 -39 -18 -39.5 -22 -41.5L-26.5 -40.5L-23.5 -38.5L-26 -35.5L-21 -37.5C-17 -36 -13 -36 -8 -38ZM2 -40.5C8 -42.5 14 -42 19 -44.5L24 -44.5L21.5 -42.2L24.5 -40L19 -41C14 -38.5 8 -38 2 -37.5Z',
    head: 'M5.5 -34C6.5 -38.5 4.5 -45.5 -1 -46.3C-4.5 -46.8 -7.5 -45.2 -8.8 -43.6C-11 -43.6 -12.8 -42 -12.4 -39.4C-11.8 -39.9 -10.8 -40.3 -9.8 -40.1L-8.3 -39.6C-7.4 -37.5 -6.5 -36 -6.5 -34Z',
    beak: 'M-8.6 -43.4Q-7.6 -41.5 -8.4 -39.7',
  };
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
      {#if device.shape === 'emblem'}
        <!-- Back to front: fouled anchor, globe, wings, eagle. Thin dark lines are the stamped detail, white ones the polish. -->
        <g transform="scale(0.76) translate(0 3)" stroke-linejoin="round">
          {#each [EGA.shank, EGA.arms, EGA.stock] as d}<path {d} vector-effect="non-scaling-stroke" />{/each}
          <path d={EGA.rope} fill="none" stroke-width="3.4" stroke-linecap="round" />
          <path d={EGA.rope} fill="none" stroke="url(#dv{uid})" stroke-opacity="1" stroke-width="2" stroke-linecap="round" />
          <path d={EGA.rope} fill="none" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="1.3 1.1" />
          <circle cy="8" r="22" vector-effect="non-scaling-stroke" />
          <circle cy="8" r="22" fill="url(#dh{uid})" stroke="none" />
          <path d={EGA.grid} fill="none" stroke-opacity="0.4" stroke-width="0.7" vector-effect="non-scaling-stroke" />
          <path d="M17.8 -2.3A20.6 20.6 0 0 1 -17.8 18.3" fill="none" stroke-opacity="0.28" stroke-width="2.6" stroke-linecap="round" />
          <path d={EGA.land} stroke-width="0.7" vector-effect="non-scaling-stroke" />
          {#each [WING, mirror(WING)] as d}<path {d} vector-effect="non-scaling-stroke" />{/each}
          <path d="{WING_LN}{mirror(WING_LN)}" fill="none" stroke-opacity="0.4" stroke-width="0.7" vector-effect="non-scaling-stroke" />
          <path d="{WING_HI}{mirror(WING_HI)}" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="1.2" stroke-linecap="round" />
          <path d={EGA.body} vector-effect="non-scaling-stroke" />
          <path d={EGA.chest} fill="none" stroke-opacity="0.35" stroke-width="0.7" vector-effect="non-scaling-stroke" />
          <path d={EGA.scroll} vector-effect="non-scaling-stroke" />
          <path d={EGA.head} vector-effect="non-scaling-stroke" />
          <path d={EGA.beak} fill="none" stroke-opacity="0.45" stroke-width="0.7" vector-effect="non-scaling-stroke" />
          <circle cx="-4.6" cy="-42.6" r="0.9" fill={dm[2]} stroke="none" />
        </g>
      {:else if device.shape === 'lamp'}
        <g transform="scale(4.2) translate(-0.5 -0.2)" stroke-linejoin="round">
          {#each LAMP as d}<path {d} fill-rule="evenodd" vector-effect="non-scaling-stroke" />{/each}
          <path d={LAMP_SH} fill="none" stroke-opacity="0.4" stroke-width="0.8" stroke-linecap="round" vector-effect="non-scaling-stroke" />
          <path d={LAMP_HI} fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="1" stroke-linecap="round" vector-effect="non-scaling-stroke" />
        </g>
      {:else}
        <rect x={-D * 1.6} y={-D * 0.4} width={D * 3.2} height={D * 0.8} rx="3" vector-effect="non-scaling-stroke" />
      {/if}
    </g>
  {/if}
  <rect x="0" y="0" width={W} height={H} fill="none" stroke="#000" stroke-opacity="0.32" stroke-width="1" vector-effect="non-scaling-stroke" shape-rendering="crispEdges" />
</svg>
