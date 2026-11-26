<script lang="ts">
  // One rank's insignia on a light tile, so black pins read in dark mode too.
  import { rankOf, type Service } from './rankArt';
  let { rank, service = 'cadet', size = 40, label }: { rank: string; service?: Service; size?: number; label?: string } = $props();
  const art = $derived(rankOf(service, rank)?.[0]);
  let loaded = $state(false);
</script>

{#if art}
  <span class="rankins" class:wait={!loaded} style="width: {size}px; height: {size}px"><img src="{import.meta.env.BASE_URL}img/ranks/{art}.png" alt={label ?? `${rank} insignia`} loading="lazy" decoding="async" onload={() => (loaded = true)} /></span>
{/if}
