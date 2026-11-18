<script module lang="ts">
  // The cadet set is drawn on the active-duty Marine Corps pattern (MCO 1020.34H) because no official cadet
  // illustration was found; the lamp of learning is left out (no source for its shape). The enlisted layout
  // (chevrons up, rockers down, crossed rifles / diamond / star) is from memory of that pattern, not checked against Figure 4-10.
  // Enlisted look chosen: gold embroidery on a dark green patch. Officer insignia are metallic gold / silver pieces on the same patch.
  let n = 0;
  type Spec = { up: number; down: number; sym?: 'rifles' | 'diamond' | 'star' } | { officer: 'gold-bar' | 'silver-bar' | 'two-bars' | 'gold-leaf' | 'silver-leaf' | 'eagle' };
  const SPEC: Record<string, Spec> = {
    'Cadet Private First Class': { up: 1, down: 0 },
    'Cadet Lance Corporal': { up: 1, down: 0, sym: 'rifles' },
    'Cadet Corporal': { up: 2, down: 0, sym: 'rifles' },
    'Cadet Sergeant': { up: 3, down: 0, sym: 'rifles' },
    'Cadet Staff Sergeant': { up: 3, down: 1, sym: 'rifles' },
    'Cadet Gunnery Sergeant': { up: 3, down: 2, sym: 'rifles' },
    'Cadet First Sergeant': { up: 3, down: 3, sym: 'diamond' },
    'Cadet Sergeant Major': { up: 3, down: 4, sym: 'star' },
    'Cadet Second Lieutenant': { officer: 'gold-bar' },
    'Cadet First Lieutenant': { officer: 'silver-bar' },
    'Cadet Captain': { officer: 'two-bars' },
    'Cadet Major': { officer: 'gold-leaf' },
    'Cadet Lieutenant Colonel': { officer: 'silver-leaf' },
    'Cadet Colonel': { officer: 'eagle' },
  };
  const chev = (y: number) => `M8 ${y + 16}L50 ${y}L92 ${y + 16}V${y + 25}L50 ${y + 9}L8 ${y + 25}Z`;
  const rock = (y: number) => `M10 ${y}Q50 ${y + 16} 90 ${y}`;
  const LEAF = 'M50 12C58 18 56 24 62 26C60 32 66 34 66 40C70 42 70 50 64 54C66 60 60 66 54 66L54 82L46 82L46 66C40 66 34 60 36 54C30 50 30 42 34 40C34 34 40 32 38 26C44 24 42 18 50 12Z';
  const EAGLE = 'M50 16L55 19L60 23L55 26L57 33L92 20L96 33L88 36L92 46L82 48L84 58L70 58L64 70L60 84L50 86';
</script>

<script lang="ts">
  let { rank, size = 36 }: { rank: string; size?: number } = $props();
  const id = `ri${n++}`;
  const spec = $derived(SPEC[rank]);
</script>

{#if spec}
  <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="{rank} insignia" class="rankins">
    <title>{rank}</title>
    <defs>
      <linearGradient id="{id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5a3b" /><stop offset="1" stop-color="#14301f" /></linearGradient>
      <radialGradient id="{id}s" cx="0.3" cy="0.2" r="0.9"><stop offset="0" stop-color="#fff" stop-opacity="0.28" /><stop offset="0.6" stop-color="#fff" stop-opacity="0" /></radialGradient>
      <linearGradient id="{id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0" /><stop offset="0.35" stop-color="#e2b93b" /><stop offset="0.7" stop-color="#9a6f1a" /><stop offset="1" stop-color="#f0cf63" /></linearGradient>
      <linearGradient id="{id}v" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" /><stop offset="0.35" stop-color="#c9d0d8" /><stop offset="0.7" stop-color="#6b7580" /><stop offset="1" stop-color="#e3e8ec" /></linearGradient>
      <pattern id="{id}p" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="1" fill="#000" opacity="0.18" /></pattern>
      <filter id="{id}f" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.6" flood-color="#000" flood-opacity="0.6" /></filter>
    </defs>
    <rect x="2" y="2" width="96" height="96" rx="16" fill="url(#{id}t)" />
    <rect x="2" y="2" width="96" height="96" rx="16" fill="url(#{id}s)" />
    <rect x="2.5" y="2.5" width="95" height="95" rx="15.5" fill="none" stroke="#000" stroke-opacity="0.5" />
    <g filter="url(#{id}f)" stroke="#5c430c" stroke-width="1">
      {#if 'up' in spec}
        {#each Array.from({ length: spec.up }, (_, i) => 6 + i * 10) as y}
          <path d={chev(y)} fill="url(#{id}g)" /><path d={chev(y)} fill="url(#{id}p)" stroke="none" />
        {/each}
        {#each Array.from({ length: spec.down }, (_, i) => 58 + i * 9) as y}
          <path d={rock(y)} fill="none" stroke="url(#{id}g)" stroke-width="6" stroke-linecap="round" />
        {/each}
        {#if spec.sym === 'rifles'}
          <g stroke="#e9c453" stroke-width="3.5" stroke-linecap="round"><path d="M38 52L62 28" /><path d="M62 52L38 28" /></g>
        {:else if spec.sym === 'diamond'}
          <path d="M50 28L62 42L50 56L38 42Z" fill="url(#{id}g)" />
        {:else if spec.sym === 'star'}
          <path d="M50 26L54 38L67 38L56.5 46L60.5 58L50 50.5L39.5 58L43.5 46L33 38L46 38Z" fill="url(#{id}g)" />
        {/if}
      {:else if spec.officer === 'gold-bar' || spec.officer === 'silver-bar'}
        <rect x="16" y="38" width="68" height="24" rx="2" fill="url(#{id}{spec.officer === 'gold-bar' ? 'g' : 'v'})" stroke={spec.officer === 'gold-bar' ? '#5c430c' : '#39424b'} />
      {:else if spec.officer === 'two-bars'}
        <rect x="16" y="24" width="68" height="20" rx="2" fill="url(#{id}v)" stroke="#39424b" /><rect x="16" y="56" width="68" height="20" rx="2" fill="url(#{id}v)" stroke="#39424b" />
      {:else if spec.officer === 'gold-leaf' || spec.officer === 'silver-leaf'}
        <path d={LEAF} fill="url(#{id}{spec.officer === 'gold-leaf' ? 'g' : 'v'})" stroke={spec.officer === 'gold-leaf' ? '#5c430c' : '#39424b'} />
      {:else}
        <g fill="url(#{id}v)" stroke="#39424b"><path d={EAGLE} /><path d={EAGLE} transform="translate(100 0) scale(-1 1)" /></g>
      {/if}
    </g>
  </svg>
{/if}
