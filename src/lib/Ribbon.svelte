<script lang="ts">
  // One ribbon as woven-fabric SVG. Stripe bands come from usmc-ribbons.json: [hexColor, widthFraction] left to right.
  // Without a sourced entry it draws a neutral placeholder (never invented colors).
  import spec from '../data/usmc-ribbons.json';
  type Entry = { bands: [string, number][]; device?: { type: 'cross' | 'star'; color: string } };
  let { name, width = 1.375, x, y, height }: { name: string; width?: number; x?: number; y?: number; height?: number } = $props();
  const entry = $derived((spec.ribbons as unknown as Record<string, Entry>)[name]);
  const h = $derived(height ?? (width * 0.375) / 1.375);
  const bands = $derived(entry?.bands ?? [['var(--line)', 0.15], ['var(--fill)', 0.7], ['var(--line)', 0.15]] as [string, number][]);
  const xs = $derived(bands.map((_, i) => bands.slice(0, i).reduce((s, b) => s + b[1], 0)));
  // Unit shapes (radius 1), scaled so they stay round on the stretched 1x1 box.
  const star = Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 ? 0.4 : 1; return `${(r * Math.cos(a)).toFixed(3)},${(r * Math.sin(a)).toFixed(3)}`; }).join(' ');
  const cross = '-0.3,-1 0.3,-1 0.3,-0.3 1,-0.3 1,0.3 0.3,0.3 0.3,1 -0.3,1 -0.3,0.3 -1,0.3 -1,-0.3 -0.3,-0.3';
  const uid = $props.id();
</script>

<svg {x} {y} {width} height={h} viewBox="0 0 1 1" preserveAspectRatio="none" role="img" aria-label="{name} ribbon{entry ? '' : ', colors not confirmed'}">
  <title>{name}{entry ? '' : ' (colors not confirmed)'}</title>
  <defs>
    <linearGradient id="sh{uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.32" />
      <stop offset="0.35" stop-color="#fff" stop-opacity="0" />
      <stop offset="0.65" stop-color="#000" stop-opacity="0" />
      <stop offset="1" stop-color="#000" stop-opacity="0.3" />
    </linearGradient>
    <pattern id="rib{uid}" width="0.0125" height="1" patternUnits="userSpaceOnUse"><rect width="0.0045" height="1" fill="#000" opacity="0.13" /></pattern>
  </defs>
  {#each bands as b, i}<rect x={xs[i]} y="0" width={b[1] + 0.002} height="1" fill={b[0]} />{/each}
  <rect width="1" height="1" fill="url(#rib{uid})" />
  <rect width="1" height="1" fill="url(#sh{uid})" />
  {#if entry?.device}
    <g transform="translate(0.5 0.5) scale({entry.device.type === 'star' ? '0.07 0.257' : '0.06 0.22'})">
      <polygon points={entry.device.type === 'star' ? star : cross} fill={entry.device.color} stroke="#000" stroke-opacity="0.45" stroke-width="0.06" />
    </g>
  {/if}
  <rect x="0" y="0" width="1" height="1" fill="none" stroke="#000" stroke-opacity="0.55" stroke-width="1" vector-effect="non-scaling-stroke" />
</svg>
