<script lang="ts">
  import type { Fact } from './bundle';
  import { isStale } from './quiz';
  import { today } from './store.svelte';
  import Cite from './Cite.svelte';

  let { rows }: { rows: Fact[] } = $props();
  const t = today();
  // One shared source for the whole table is cited once underneath; mixed sources are cited row by row.
  const shared = $derived(rows.every((f) => f.source.url === rows[0].source.url && f.source.locator === rows[0].source.locator && f.verified_on === rows[0].verified_on));
</script>

<table>
  <thead><tr><th class="num" scope="col">No.</th><th scope="col">Item</th></tr></thead>
  <tbody>
    {#each rows as f, i}
      <tr>
        <td class="num">{i + 1}</td>
        <td>
          {f.text}
          {#if f.confidence === 'verify'}<span class="tag">Not verified</span>{:else if isStale(f, t)}<span class="tag">Check date</span>{/if}
          {#if !shared}<Cite fact={f} />{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
{#if shared}<Cite fact={rows[0]} />{/if}
