<script lang="ts">
  // One rank's insignia on a light tile, so black pins read in dark mode too.
  import { rankOf, type Service } from './rankArt';
  let { rank, service = 'cadet', size = 40 }: { rank: string; service?: Service; size?: number } = $props();
  const art = $derived(rankOf(service, rank)?.[0]);
</script>

{#if art}
  <span class="rankins" style="width: {size}px; height: {size}px"><img src="{import.meta.env.BASE_URL}img/ranks/{art}.png" alt="{rank} insignia" loading="lazy" decoding="async" /></span>
{/if}
