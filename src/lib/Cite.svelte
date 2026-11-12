<script lang="ts">
  import type { Fact } from './bundle';
  import { isStale } from './quiz';
  import { fmtDate, today } from './store.svelte';
  let { fact }: { fact: Fact } = $props();
</script>

<p class="cite">
  Source: <a href={fact.source.url} target="_blank" rel="noopener noreferrer">{fact.source.title}</a>, {fact.source.locator}.
  {fact.edition}. Verified {fmtDate(fact.verified_on)}.
  {#if isStale(fact, today())}Past its 30-day review date.{/if}
</p>
