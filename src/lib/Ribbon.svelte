<script lang="ts">
  // One ribbon as SVG. Stripe bands come from usmc-ribbons.json: [hexColor, widthFraction] left to right.
  // Without a sourced entry it draws a neutral placeholder (never invented colors).
  import spec from '../data/usmc-ribbons.json';
  let { name, width = 1.375, x, y, height }: { name: string; width?: number; x?: number; y?: number; height?: number } = $props();
  const entry = $derived((spec.ribbons as Record<string, { bands: [string, number][] }>)[name]);
  const h = $derived(height ?? (width * 0.375) / 1.375);
  const bands = $derived(entry?.bands ?? [['var(--line)', 0.15], ['var(--fill)', 0.7], ['var(--line)', 0.15]] as [string, number][]);
  const xs = $derived(bands.map((_, i) => bands.slice(0, i).reduce((s, b) => s + b[1], 0)));
</script>

<svg {x} {y} {width} height={h} viewBox="0 0 1 1" preserveAspectRatio="none" role="img" aria-label="{name} ribbon{entry ? '' : ', colors not confirmed'}">
  <title>{name}{entry ? '' : ' (colors not confirmed)'}</title>
  {#each bands as b, i}<rect x={xs[i]} y="0" width={b[1]} height="1" fill={b[0]} />{/each}
  <rect x="0" y="0" width="1" height="1" fill="none" stroke="var(--ink-2)" stroke-width="0.02" vector-effect="non-scaling-stroke" />
</svg>
