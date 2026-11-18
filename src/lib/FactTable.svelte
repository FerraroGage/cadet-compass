<script lang="ts">
  import type { Fact } from './bundle';
  import { isStale } from './quiz';
  import { app, today, setHidden } from './store.svelte';
  import Cite from './Cite.svelte';
  import RankInsignia from './RankInsignia.svelte';
  import { isCadetRank } from './cadetRanks';

  // `toggle`: show a switch on each row to hide it from quizzes (Learn uses this).
  let { rows, toggle = false }: { rows: Fact[]; toggle?: boolean } = $props();
  const t = today();
  // One shared source for the whole table is cited once underneath; mixed sources are cited row by row.
  const shared = $derived(rows.every((f) => f.source.url === rows[0].source.url && f.source.locator === rows[0].source.locator && f.verified_on === rows[0].verified_on));
</script>

<table>
  <thead><tr><th class="num" scope="col">No.</th><th scope="col">Item</th>{#if toggle}<th scope="col" class="sw">In quizzes</th>{/if}</tr></thead>
  <tbody>
    {#each rows as f, i}
      <tr class:off={app.hidden.includes(f.id)}>
        <td class="num">{i + 1}</td>
        <td>
          {#if f.module === 'ranks' && isCadetRank(f.a) && f.a !== 'Cadet Private'}<span class="rankcell"><RankInsignia rank={f.a} size={36} /></span>{/if}
          {f.text}
          {#if f.confidence === 'verify'}<span class="tag">Not verified</span>{:else if isStale(f, t)}<span class="tag">Check date</span>{/if}
          {#if !shared}<Cite fact={f} />{/if}
        </td>
        {#if toggle}
          <td class="sw">
            <button class="switch" role="switch" aria-checked={!app.hidden.includes(f.id)} aria-label="Include in quizzes: {f.text}" onclick={() => setHidden([f.id], !app.hidden.includes(f.id))}><i></i></button>
          </td>
        {/if}
      </tr>
    {/each}
  </tbody>
</table>
{#if shared}<Cite fact={rows[0]} />{/if}
