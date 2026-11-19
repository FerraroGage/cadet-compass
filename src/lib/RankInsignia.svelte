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
  // The lamp of learning, side view, about 43 x 17 around the origin: [handle loop with hole, body + spout + foot, knob], plus a top-edge highlight.
  export const LAMP = [
    'M-9 -3C-14 -6-21 -3-21 1C-21 5-15 6.5-9.5 3ZM-12.5 0C-15-2-18-1.5-18 1C-18 3-15 3.5-12.5 2Z',
    'M-11 0C-11 -3.5-6 -5 0 -5C6 -5 10 -5 13 -4.2C16 -5.5 19 -7 22 -8.5C20 -5 17 -2 14.5 1C12.5 4.5 7 5 3.5 5.2L5 6.5C6.5 7 7.5 7.5 7.8 8.5L-7.8 8.5C-7.5 7.5-6.5 7-5 6.5L-3.5 5.2C-8 5-11 3.5-11 0Z',
    'M-2.7 -4.8C-2.7 -7.5-1.5 -8.5 0 -8.5C1.5 -8.5 2.7 -7.5 2.7 -4.8Z'
  ];
  export const LAMP_HI = 'M-9.5 -2C-7 -3.7-3 -4.2 0 -4.2C4 -4.2 8 -4.1 12 -3.4';
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
        <g transform="translate(50 {layout.lampY}) scale({layout.scale})" fill="url(#{id}k)" stroke="#8c949c" stroke-width="0.5" stroke-linejoin="round">
          {#each LAMP as d}<path {d} fill-rule="evenodd" />{/each}
          <path d={LAMP_HI} fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="0.7" stroke-linecap="round" />
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
