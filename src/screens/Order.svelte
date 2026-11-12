<script lang="ts">
  // Seniority Ladder, Rack Builder and Chain Builder are the same exercise on three lists:
  // put a handful of items back in their true order. Buttons move the rows, so it works with a keyboard and a screen reader.
  import { app } from '../lib/store.svelte';
  import { shuffle } from '../lib/quiz';
  import Cite from '../lib/Cite.svelte';

  let { which }: { which: string } = $props();
  const facts = app.bundle!.facts;
  const ordered = (group: string) => facts.filter((f) => f.group === group && f.order).sort((a, b) => a.order! - b.order!);
  // Cadet ranks, senior first, in the order the Cadet Handbook lists them (p. 10 to 11).
  const RANKS = ['Cadet Colonel', 'Cadet Lieutenant Colonel', 'Cadet Major', 'Cadet Captain', 'Cadet First Lieutenant', 'Cadet Second Lieutenant', 'Cadet Sergeant Major', 'Cadet First Sergeant', 'Cadet Gunnery Sergeant', 'Cadet Staff Sergeant', 'Cadet Sergeant', 'Cadet Corporal', 'Cadet Lance Corporal', 'Cadet Private First Class', 'Cadet Private'];
  const GAMES: Record<string, { title: string; task: string; items: string[]; cite: string }> = {
    ranks: { title: 'Seniority Ladder', task: 'Put these cadet ranks in order, senior at the top.', items: RANKS, cite: 'usmc.ranks.structure' },
    ribbons: { title: 'Rack Builder', task: 'Put these ribbons in order of precedence, senior at the top.', items: ordered('ribbon').map((f) => f.a), cite: 'usmc.ribbons.order-legion-of-valor' },
    chain: { title: 'Chain Builder', task: 'Put these in chain of command order, from the top down.', items: ordered('position').map((f) => f.a), cite: 'usmc.chain.pos-president-of-the-united-states' },
  };
  // svelte-ignore state_referenced_locally (the screen is rebuilt whenever the address changes)
  const game = GAMES[which] ?? GAMES.ranks;
  const source = facts.find((f) => f.id === game.cite);
  const SIZE = 6;

  let rows = $state<string[]>([]);
  let checked = $state(false);
  let started = Date.now();
  let seconds = $state(0);
  const answer = $derived([...rows].sort((a, b) => game.items.indexOf(a) - game.items.indexOf(b)));
  const score = $derived(rows.filter((r, i) => r === answer[i]).length);

  function deal() {
    const pick = shuffle(game.items).slice(0, SIZE);
    do rows = shuffle(pick); while (rows.every((r, i) => r === [...pick].sort((a, b) => game.items.indexOf(a) - game.items.indexOf(b))[i]));
    checked = false;
    started = Date.now();
  }
  deal();
  function move(i: number, by: number) {
    const j = i + by;
    if (j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  function check() { seconds = Math.round((Date.now() - started) / 1000); checked = true; }
</script>

<h1>{game.title}</h1>
<p>{game.task}</p>

<table>
  <thead><tr><th class="num" scope="col">No.</th><th scope="col">Item</th><th scope="col">{checked ? 'Result' : 'Move'}</th></tr></thead>
  <tbody>
    {#each rows as r, i (r)}
      <tr>
        <td class="num">{i + 1}</td>
        <td>{r}{#if checked && r !== answer[i]}<p class="cite">Belongs at {answer.indexOf(r) + 1}</p>{/if}</td>
        <td style="white-space: nowrap; width: 1%">
          {#if checked}
            <span class="verdict {r === answer[i] ? 'good' : 'bad'}">{r === answer[i] ? 'Right' : 'Wrong'}</span>
          {:else}
            <button class="btn" style="padding: 0 12px" disabled={i === 0} onclick={() => move(i, -1)} aria-label="Move {r} up">Up</button>
            <button class="btn" style="padding: 0 12px" disabled={i === rows.length - 1} onclick={() => move(i, 1)} aria-label="Move {r} down">Down</button>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#if checked}
  <p aria-live="polite" style="margin-top: 16px"><span class="num">{score}</span> of <span class="num">{rows.length}</span> in the right place, in <span class="num">{seconds}</span> seconds.</p>
  {#if source}<Cite fact={source} />{/if}
{/if}
<div class="row">
  {#if checked}<button class="btn primary" onclick={deal}>New round</button>{:else}<button class="btn primary" onclick={check}>Check order</button>{/if}
  <a class="btn" href="#/train">Training menu</a>
</div>
