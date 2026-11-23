<script module lang="ts">
  // MCJROTC cadet insignia, drawn from the program's insignia chart (supplied by the owner, an MCJROTC cadet):
  // enlisted wear black chevrons with the lamp of learning in place of crossed rifles, rockers below for staff NCOs,
  // officers wear silver disks, then silver diamonds.
  let n = 0;
  type Spec = { chev: number; rock: number } | { shape: 'disk' | 'diamond'; count: number };
  const SPEC: Record<string, Spec> = {
    'Cadet Private First Class': { chev: 0, rock: 0 },
    'Cadet Lance Corporal': { chev: 1, rock: 0 },
    'Cadet Corporal': { chev: 2, rock: 0 },
    'Cadet Sergeant': { chev: 3, rock: 0 },
    'Cadet Staff Sergeant': { chev: 3, rock: 1 },
    'Cadet Gunnery Sergeant': { chev: 3, rock: 2 },
    'Cadet First Sergeant': { chev: 3, rock: 3 },
    'Cadet Sergeant Major': { chev: 3, rock: 4 },
    'Cadet Second Lieutenant': { shape: 'disk', count: 1 },
    'Cadet First Lieutenant': { shape: 'disk', count: 2 },
    'Cadet Captain': { shape: 'disk', count: 3 },
    'Cadet Major': { shape: 'diamond', count: 1 },
    'Cadet Lieutenant Colonel': { shape: 'diamond', count: 2 },
    'Cadet Colonel': { shape: 'diamond', count: 3 },
  };
  // One chevron band: an upward point, 7 units thick, apex at y.
  const chev = (y: number) => `M12 ${y + 26}L50 ${y}L88 ${y + 26}L88 ${y + 34}L50 ${y + 8}L12 ${y + 34}Z`;
  // One rocker: a band curving down between the chevron tips, top edge at y.
  const rock = (y: number) => `M12 ${y}Q50 ${y + 10} 88 ${y}L88 ${y + 6}Q50 ${y + 16} 12 ${y + 6}Z`;
  // The lamp of learning is the owner's black-on-white art, used as a silhouette mask (shape is ~200 x 120 inside the 225 x 225 image).
  const lampSrc = import.meta.env.BASE_URL + 'img/devices/lamp.jpg';
</script>

<script lang="ts">
  let { rank, size = 40 }: { rank: string; size?: number } = $props();
  const id = `ri${n++}`;
  const spec = $derived(SPEC[rank]);
  // Enlisted layout, top to bottom: chevrons, lamp, rockers.
  const layout = $derived.by(() => {
    if (!spec || !('chev' in spec)) return null;
    const lampY = spec.chev ? 6 + (spec.chev - 1) * 11 + 34 + 12 : 65;
    return { lampY, scale: spec.chev ? 1 : 1.7, rocks: Array.from({ length: spec.rock }, (_, k) => lampY + 12 + k * 8) };
  });
</script>

{#if spec}
  <svg width={size} height={size} viewBox={layout ? '-15 0 130 130' : '0 0 100 100'} role="img" aria-label="{rank} insignia" class="rankins">
    <title>{rank}</title>
    <defs>
      <!-- Black metal: dark gradient with a light top edge and a soft shadow. Silver: a bright-to-dark sweep. -->
      <linearGradient id="{id}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6067" /><stop offset="0.45" stop-color="#1c1f23" /><stop offset="1" stop-color="#34393f" /></linearGradient>
      <linearGradient id="{id}v" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" /><stop offset="0.35" stop-color="#cfd5dc" /><stop offset="0.7" stop-color="#76808b" /><stop offset="1" stop-color="#e6eaee" /></linearGradient>
      <linearGradient id="{id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f6" /><stop offset="1" stop-color="#dfe2e6" /></linearGradient>
      <filter id="{id}i" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="-3 0 0 0 2  0 -3 0 0 2  0 0 -3 0 2  0 0 0 1 0" /></filter>
      <mask id="{id}m" maskUnits="userSpaceOnUse" x="-60" y="-40" width="120" height="80"><g transform="scale(0.18) translate(-115 -120)"><image href={lampSrc} width="225" height="225" filter="url(#{id}i)" /></g></mask>
      <filter id="{id}f" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.4" flood-color="#000" flood-opacity="0.45" /></filter>
    </defs>
    <!-- A light tile behind every insignia, so black pins read in dark mode too. -->
    {#if layout}<rect x="-13" y="2" width="126" height="126" rx="20" fill="url(#{id}t)" />{:else}<rect x="2" y="2" width="96" height="96" rx="16" fill="url(#{id}t)" />{/if}
    <g filter="url(#{id}f)">
      {#if layout && 'chev' in spec}
        <g fill="url(#{id}k)" stroke="#8c949c" stroke-width="0.8" stroke-linejoin="round">
          {#each Array.from({ length: spec.chev }, (_, k) => 6 + k * 11) as y}<path d={chev(y)} />{/each}
          {#each layout.rocks as y}<path d={rock(y)} />{/each}
        </g>
        <!-- The lamp of learning: an oil lamp, no flame -->
        <g transform="translate(50 {layout.lampY}) scale({layout.scale})">
          <rect x="-20" y="-12" width="40" height="24" mask="url(#{id}m)" fill="#8c949c" transform="translate(0 -0.7)" />
          <rect x="-20" y="-12" width="40" height="24" mask="url(#{id}m)" fill="url(#{id}k)" />
          <rect x="-20" y="-12" width="40" height="12" mask="url(#{id}m)" fill="#fff" opacity="0.18" />
        </g>
      {:else if 'shape' in spec}
        <!-- Silver pieces in a row, centered; a highlight and the shadow give them depth. -->
        {#each Array.from({ length: spec.count }, (_, k) => 50 + (k - (spec.count - 1) / 2) * (spec.count === 3 ? 29 : 32)) as x}
          {#if spec.shape === 'disk'}
            <circle cx={x} cy="50" r="12.5" fill="url(#{id}v)" stroke="#5d6670" />
            <circle cx={x} cy="50" r="8.5" fill="none" stroke="#fff" stroke-opacity="0.4" />
            <ellipse cx={x - 4} cy="45" rx="4" ry="2.5" fill="#fff" opacity="0.75" />
          {:else}
            <path d="M{x} 28L{x + 14} 50L{x} 72L{x - 14} 50Z" fill="url(#{id}v)" stroke="#5d6670" />
            <path d="M{x} 28L{x + 14} 50L{x} 50Z" fill="#fff" opacity="0.3" />
            <path d="M{x} 50L{x - 14} 50L{x} 72Z" fill="#000" opacity="0.15" />
          {/if}
        {/each}
      {/if}
    </g>
  </svg>
{/if}
