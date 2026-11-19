<script lang="ts">
  // Colored front view of each uniform, male or female cut. No emblems: plain discs mark where they go.
  // Colors/items follow the MCJROTC handbook uniform table (pp. 11-16): blue/green coat or khaki shirt, blue/green slacks or skirt, camouflage utility.
  import { data } from './uniform';
  import { term } from './terms';
  let { id, cut = 'male' }: { id: string; cut?: 'male' | 'female' } = $props();
  const u = $derived(data.uniforms.find((x) => x.id === id));
  const f = $derived(cut === 'female');
  const uid = $derived(`${id}-${cut}`);
  const blue = $derived(id.startsWith('blue'));
  const util = $derived(id === 'utility');
  const coat = $derived(id === 'blue-dress-b' || id === 'service-a');
  const longSleeve = $derived(id !== 'blue-dress-d' && id !== 'service-c');
  const tie = $derived(id === 'blue-dress-c' || id === 'service-a' || id === 'service-b');
  const shirtC = '#c9b27c';
  const top = $derived(coat ? (blue ? '#1d2d57' : '#46603c') : shirtC);
  const bottom = $derived(blue ? '#1d2d57' : '#46603c');
  const camo = $derived(`url(#camo-${uid})`);
  const torso = $derived(
    f
      ? 'M72 26 L56 34 L54 70 Q64 100 62 114 L52 142 L148 142 L138 114 Q136 100 146 70 L144 34 L128 26 Z'
      : 'M70 26 L52 34 L50 142 L150 142 L148 34 L130 26 Z',
  );
  const legs = $derived(
    f && !util
      ? 'M54 142 L146 142 L158 236 L42 236 Z'
      : f
        ? 'M54 142 L146 142 L148 298 L106 298 L100 190 L94 298 L52 298 Z'
        : 'M50 142 L150 142 L148 298 L106 298 L100 190 L94 298 L52 298 Z',
  );
  const sleeve = $derived(longSleeve ? 'M52 34 L36 40 L26 152 L42 154 L52 80 Z' : 'M52 34 L36 40 L32 80 L50 84 Z');
  const btn = $derived(coat ? '#d9a93a' : '#8a7648');
  const ln = 'rgba(20,20,20,.55)';
</script>

{#snippet shade(d: string, fill: string)}
  <path {d} {fill} stroke={ln} stroke-width="1.2" stroke-linejoin="round" />
  <path {d} fill="url(#sh-{uid})" />
{/snippet}
{#snippet dot(x: number, y: number, c: string, r = 2.6)}
  <circle cx={x} cy={y} {r} fill={c} stroke="rgba(0,0,0,.45)" stroke-width=".6" /><circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" fill-opacity=".5" />
{/snippet}
{#snippet pocket(x: number, y: number, w: number, h: number)}
  <rect {x} {y} width={w} height={h} rx="1.5" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="1.1" />
  <path d="M{x} {y} h{w} v{h * 0.36} L{x + w / 2} {y + h * 0.5} L{x} {y + h * 0.36} Z" fill="rgba(0,0,0,.1)" stroke="rgba(0,0,0,.4)" stroke-width="1.1" />
{/snippet}

<svg class="uo" viewBox="0 0 200 310" role="img" aria-label="{term(u?.name ?? 'Uniform')}, {cut} version, front view">
  <defs>
    <linearGradient id="sh-{uid}" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".22" /><stop offset=".35" stop-color="#fff" stop-opacity=".1" />
      <stop offset=".65" stop-color="#fff" stop-opacity="0" /><stop offset="1" stop-color="#000" stop-opacity=".25" />
    </linearGradient>
    <pattern id="camo-{uid}" width="46" height="46" patternUnits="userSpaceOnUse">
      <rect width="46" height="46" fill="#566b36" />
      <ellipse cx="10" cy="12" rx="13" ry="8" fill="#7b6b3d" /><ellipse cx="34" cy="8" rx="9" ry="6" fill="#2e3b1e" />
      <ellipse cx="30" cy="30" rx="14" ry="8" fill="#7b6b3d" /><ellipse cx="8" cy="36" rx="10" ry="6" fill="#2e3b1e" />
      <ellipse cx="22" cy="20" rx="7" ry="4" fill="#1d1d14" /><ellipse cx="42" cy="40" rx="6" ry="4" fill="#1d1d14" />
      <ellipse cx="2" cy="22" rx="5" ry="3" fill="#8f8a55" />
    </pattern>
  </defs>
  <rect width="200" height="310" rx="12" fill="var(--sheet)" />

  <!-- legs: slacks or skirt, shoes -->
  {#if f && !util}
    <path d="M68 236 L96 236 L94 292 L70 292 Z M104 236 L132 236 L130 292 L106 292 Z" fill="#3a2f2c" />
    <path d="M66 292 L96 292 L96 304 L62 304 Z M104 292 L134 292 L138 304 L104 304 Z" fill="#111" />
  {:else}
    <path d={util ? 'M50 288 L96 288 L96 304 L44 304 Z M104 288 L150 288 L156 304 L104 304 Z' : 'M52 292 L96 292 L96 304 L46 304 Z M104 292 L148 292 L154 304 L104 304 Z'} fill={util ? '#6a5130' : '#111'} stroke={ln} stroke-width="1" />
  {/if}
  {@render shade(legs, util ? camo : bottom)}
  {#if !f && blue}<rect x="50" y="144" width="3" height="150" fill="#b3202a" /><rect x="147" y="144" width="3" height="150" fill="#b3202a" />{/if}
  {#if util}{@render pocket(54, 180, 30, 26)}{@render pocket(116, 180, 30, 26)}{/if}

  <!-- sleeves -->
  {@render shade(sleeve, util ? camo : top)}
  <g transform="translate(200 0) scale(-1 1)">{@render shade(sleeve, util ? camo : top)}</g>
  {#if longSleeve && !util}
    <path d="M27 140 L41 142 M159 142 L173 140" stroke="rgba(0,0,0,.35)" stroke-width="1.3" />
    {#if coat}<path d="M26 146 L42 148 M158 148 L174 146" stroke={btn} stroke-width="2.4" />{/if}
  {/if}
  {#if util}<path d="M26 120 L42 122 M158 122 L174 120" stroke="rgba(0,0,0,.35)" stroke-width="1.3" />{/if}

  <!-- body -->
  {@render shade(torso, util ? camo : top)}
  {#if f}<path d="M86 70 Q92 90 86 100 M114 70 Q108 90 114 100" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="1.2" />{/if}
  <line x1="100" y1="58" x2="100" y2="142" stroke="rgba(0,0,0,.35)" stroke-width="1.1" />

  <!-- neck / collar -->
  {#if id === 'blue-dress-b'}
    {@render shade('M82 24 L118 24 L120 38 L100 44 L80 38 Z', top)}
    {@render dot(88, 34, btn, 2.4)}{@render dot(112, 34, btn, 2.4)}
  {:else if coat}
    <path d="M84 24 L100 74 L116 24 Z" fill={shirtC} stroke={ln} stroke-width="1" />
    <path d="M84 24 L100 40 L116 24 L122 38 L100 56 L78 38 Z" fill="#b59d66" stroke={ln} stroke-width="1" />
    {@render shade('M84 24 L100 78 L76 52 L62 34 L72 26 Z M116 24 L100 78 L124 52 L138 34 L128 26 Z', top)}
    {@render dot(76, 38, btn, 2.2)}{@render dot(124, 38, btn, 2.2)}
  {:else}
    <path d="M86 24 L100 46 L114 24 Z" fill={util ? '#3d4a26' : '#b98c68'} stroke={ln} stroke-width="1" />
    <path d="M80 24 L100 50 L86 54 L70 34 Z M120 24 L100 50 L114 54 L130 34 Z" fill={util ? '#566b36' : '#b59d66'} stroke={ln} stroke-width="1.2" stroke-linejoin="round" />
  {/if}
  {#if tie}
    <path d="M95 44 L105 44 L103 52 L106 100 L100 108 L94 100 L97 52 Z" fill="#5a5a2a" stroke={ln} stroke-width="1" />
  {/if}

  <!-- pockets, buttons, belt -->
  {#if coat}
    {@render pocket(112, 76, 26, 22)}
    {@render pocket(60, 112, 30, 16)}{@render pocket(110, 112, 30, 16)}
    {#each [84, 100, 116, 132] as y}{@render dot(100, y, btn)}{/each}
  {:else if util}
    {@render pocket(60, 70, 28, 24)}{@render pocket(112, 70, 28, 24)}
    {#each [64, 90, 116] as y}{@render dot(100, y, '#2e3b1e', 2)}{/each}
  {:else}
    {@render pocket(60, 70, 28, 24)}{@render pocket(112, 70, 28, 24)}
    {#each [60, 86, 112, 134] as y}{@render dot(100, y, btn, 2)}{/each}
  {/if}
  {#if !coat}
    <rect x={f ? 52 : 50} y="136" width={f ? 96 : 100} height="8" fill={util ? '#8a7648' : '#1b1b1b'} stroke={ln} stroke-width="1" />
    <rect x="93" y="134" width="14" height="12" rx="1.5" fill="#d9a93a" stroke={ln} stroke-width=".8" /><rect x="96" y="137" width="8" height="6" fill="none" stroke="rgba(0,0,0,.4)" stroke-width=".8" />
  {/if}

  <!-- faint placement marks: ribbons above the left pocket, nametag at the right pocket, plain disc where an emblem would go -->
  {#if !util}<rect x="114" y="62" width="22" height="9" rx="1" fill="none" stroke="var(--branch)" stroke-width="1.3" stroke-dasharray="3 2" opacity=".7" />{/if}
  <rect x="62" y={util ? 56 : 62} width="22" height="7" rx="1" fill="none" stroke="var(--branch)" stroke-width="1.3" stroke-dasharray="3 2" opacity=".7" />
  {#if util}<circle cx="100" cy="30" r="3" fill="#8a7648" opacity=".6" />{/if}
</svg>

<style>
  .uo { display: block; margin: 0 auto 0.75rem; width: 100%; max-width: 480px; height: auto; }
</style>
