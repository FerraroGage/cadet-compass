<script lang="ts">
  // One ribbon as woven-fabric SVG. Stripe bands come from usmc-ribbons.json: [hexColor, widthFraction] left to right.
  // Without a sourced entry it draws a neutral placeholder (never invented colors).
  import spec from '../data/usmc-ribbons.json';
  type Entry = { bands: [string, number][]; device?: { type: 'cross' | 'star'; color: string } };
  let { name, width = 1.375, x, y, height, device }: { name: string; width?: number; x?: number; y?: number; height?: number; device?: { metal: string; shape: 'emblem' | 'lamp' | 'bar' } } = $props();
  const entry = $derived((spec.ribbons as unknown as Record<string, Entry>)[name]);
  const h = $derived(height ?? (width * 0.375) / 1.375);
  const bands = $derived(entry?.bands ?? [['var(--line)', 0.15], ['var(--fill)', 0.7], ['var(--line)', 0.15]] as [string, number][]);
  const xs = $derived(bands.map((_, i) => bands.slice(0, i).reduce((s, b) => s + b[1], 0)));
  // Unit shapes (radius 1), scaled so they stay round on the stretched 1x1 box.
  const star = Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 ? 0.4 : 1; return `${(r * Math.cos(a)).toFixed(3)},${(r * Math.sin(a)).toFixed(3)}`; }).join(' ');
  const cross = '-0.3,-1 0.3,-1 0.3,-0.3 1,-0.3 1,0.3 0.3,0.3 0.3,1 -0.3,1 -0.3,0.3 -1,0.3 -1,-0.3 -0.3,-0.3';
  const uid = $props.id();
  // Repeat-award device: one, centered, sized in ribbon-height units so it stays round on the stretched box.
  const metals: Record<string, [string, string, string]> = { bronze: ['#e6b17a', '#b0662b', '#6e3a14'], silver: ['#f4f6f8', '#b9bfc6', '#7b838c'], gold: ['#ffe27a', '#d9a520', '#8a6410'] };
  const shapes = { emblem: { pts: Array.from({ length: 16 }, (_, i) => `${Math.cos((i * Math.PI) / 8).toFixed(3)},${Math.sin((i * Math.PI) / 8).toFixed(3)}`).join(' ') }, lamp: { pts: '0,-1 0.8,0 0,1 -0.8,0' }, bar: { pts: '-2,-0.45 2,-0.45 2,0.45 -2,0.45' } };
  const dm = $derived(device ? metals[device.metal] : undefined);
  const R = 0.3; // device radius as a fraction of ribbon height
  const dsx = $derived(R * h / width), dsy = R;
</script>

<svg {x} {y} {width} height={h} viewBox="0 0 1 1" preserveAspectRatio="none" role="img" aria-label="{name} ribbon{entry ? '' : ', colors not confirmed'}">
  <title>{name}{entry ? '' : ' (colors not confirmed)'}</title>
  <defs>
    <linearGradient id="sh{uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.2" />
      <stop offset="0.22" stop-color="#fff" stop-opacity="0" />
      <stop offset="0.8" stop-color="#000" stop-opacity="0" />
      <stop offset="1" stop-color="#000" stop-opacity="0.1" />
    </linearGradient>
    <pattern id="rib{uid}" width="0.0125" height="1" patternUnits="userSpaceOnUse"><rect width="0.0045" height="1" fill="#000" opacity="0.045" /></pattern>
  </defs>
  {#each bands as b, i}<rect x={xs[i]} y="0" width={b[1] + 0.002} height="1" fill={b[0]} />{/each}
  <rect width="1" height="1" fill="url(#rib{uid})" />
  <rect width="1" height="1" fill="url(#sh{uid})" />
  {#if entry?.device}
    <g transform="translate(0.5 0.5) scale({entry.device.type === 'star' ? '0.07 0.257' : '0.06 0.22'})">
      <polygon points={entry.device.type === 'star' ? star : cross} fill={entry.device.color} stroke="#000" stroke-opacity="0.45" stroke-width="0.06" />
    </g>
  {/if}
  {#if device && dm}
    <defs><linearGradient id="dv{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color={dm[0]} /><stop offset="0.5" stop-color={dm[1]} /><stop offset="1" stop-color={dm[2]} /></linearGradient></defs>
    <g transform="translate(0.5 0.5) scale({dsx} {dsy})"><polygon points={shapes[device.shape].pts} fill="url(#dv{uid})" stroke="#000" stroke-opacity="0.5" stroke-width="0.08" /></g>
  {/if}
  <rect x="0" y="0" width="1" height="1" fill="none" stroke="#000" stroke-opacity="0.3" stroke-width="1" vector-effect="non-scaling-stroke" />
</svg>
