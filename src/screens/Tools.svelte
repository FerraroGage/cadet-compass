<script lang="ts">
  // Tools: things a cadet uses, not studies. Uniform tools are Marine Corps only (their data is).
  import { app } from '../lib/store.svelte';
  const usmc = $derived(app.profile?.branch === 'usmc');
  // [link, name, what it does, icon path on a 24 grid, Marine Corps only]
  const TOOLS: [string, string, string, string, boolean][] = [
    ['#/tools/rack', 'Ribbon rack builder', 'Pick your ribbons and devices. It sorts them and lays out the rack.', 'M4 7h5v4H4zM10 7h5v4h-5zM16 7h4v4h-4zM7 13h5v4H7zM13 13h5v4h-5z', true],
    ['#/tools/placement', 'Placement guide', 'Where rank, ribbons, badges and nametag go on each uniform.', 'M12 3v18M5 8h14M7 14h10', true],
    ['#/tools/checklist', 'Inspection checklist', 'Check your uniform line by line before you fall in.', 'M9 11l3 3 8-8M4 5h3M4 12h3M4 19h3M10 19h10', true],
    ['#/tools/sizing', 'Sizing calculator', 'Enter your measurements to find your utility size and learn how to measure for the rest.', 'M3 17h18v3H3zM6 17v-3M10 17v-3M14 17v-3M18 17v-3M12 3v9M8 8l4-5 4 5', true],
    ['#/train/metronome', 'Drill metronome', 'Hear the cadence for quick time, slow time and double time.', 'M12 3l6 18H6zM12 14l5-7', false],
  ];
</script>

<h1>Tools</h1>
<p class="label">Quick help for uniform prep and drill.</p>
<div class="games">
  {#each TOOLS.filter((x) => usmc || !x[4]) as [href, name, note, icon]}
    <a class="gcard" {href}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={icon} /></svg>
      <strong>{name}</strong><small>{note}</small>
    </a>
  {/each}
</div>
{#if !usmc}<p class="help" style="margin-top: 16px">The uniform tools cover Marine Corps JROTC so far. Your branch's are not published yet.</p>{/if}
