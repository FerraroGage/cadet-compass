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
  // The lamp of learning, a classical oil lamp from the side, about 43 x 18 around the origin:
  // [curled handle with a hole, low body + tapering spout + flared foot, lid rim, domed lid + knob],
  // plus top-edge highlights and an under-edge shadow (with the dark opening at the spout tip).
  export const LAMP = [
    'M-9.6 -2.6C-12.2 -6.3-18.4 -7-20.8 -3.6C-22.8 -0.6-20.6 4.4-14.6 4C-12.6 3.8-11.2 3.1-10.2 2.4ZM-11.6 -1.2C-13 -4-17.4 -4.6-18.7 -2.1C-19.8 0.2-17.6 2.2-14.6 1.9C-13.3 1.7-12.3 1.1-11.6 0.4Z',
    'M-11 -0.8C-10.4 -3.4-5.6 -4.1 0 -4.1C5 -4.1 9.2 -3.7 12.2 -3.7C15.4 -3.7 18.3 -5.6 21.2 -8.1L22.4 -6.8C19.4 -3.9 16.6 -1.2 13.6 0.7C10.6 3.2 6.6 4.1 3.2 4.3C3.4 6 4.8 7.3 7.2 7.9L7.2 8.9L-7.2 8.9L-7.2 7.9C-4.8 7.3-3.4 6-3.2 4.3C-7.6 4-11.3 2.5-11 -0.8Z',
    'M-5.4 -4.6L5.4 -4.6L4.8 -3.4L-4.8 -3.4Z',
    'M-4.3 -4.5C-4.3 -6.3-2.7 -7-1.1 -7.1C-1.7 -7.7-1.4 -9 0 -9C1.4 -9 1.7 -7.7 1.1 -7.1C2.7 -7 4.3 -6.3 4.3 -4.5Z'
  ];
  export const LAMP_HI = 'M-10 -1.4C-9.2 -2.8-7.6 -3.3-5.6 -3.5M5.6 -3.4C9 -3.1 12 -3 14 -3.5C16.5 -4.3 18.5 -5.6 20.6 -7.3M-3.2 -4.9C-3 -5.9-2 -6.3-0.9 -6.4';
  export const LAMP_SH = 'M-9.4 1.6C-7 3.2-3 3.5 0 3.5C5 3.5 9.4 2.6 12.4 0.2M-6.2 8.1H6.2M21.5 -7.6L22 -7';
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
          <path d={LAMP_SH} fill="none" stroke="#000" stroke-opacity="0.6" stroke-width="0.8" stroke-linecap="round" />
          <path d={LAMP_HI} fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="0.6" stroke-linecap="round" />
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
