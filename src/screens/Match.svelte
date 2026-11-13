<script lang="ts">
  // Match Up: six questions and their six answers, shuffled on a board. Tap a question, then its answer.
  import { app, facts, save, tick, award, today } from '../lib/store.svelte';
  import { quizzable, shuffle, MODULES } from '../lib/quiz';

  let { params }: { params: URLSearchParams } = $props();
  const PAIRS = 6;
  const t = today();
  // svelte-ignore state_referenced_locally (the screen is rebuilt whenever the address changes)
  const mod = params.get('module') ?? '';
  const KEY = 'match' + (mod ? '-' + mod : '');
  // Short questions with answers that are unique on the board, so every pair has one right match.
  const pool = shuffle(facts().filter((f) => quizzable(f, t) && (!mod || f.module === mod) && f.q.length <= 90 && f.a.length <= 48));
  const picks = pool.filter((f, i) => pool.findIndex((g) => g.a.toLowerCase() === f.a.toLowerCase()) === i).slice(0, PAIRS);
  type Tile = { key: string; id: string; text: string; side: 'q' | 'a' };
  const tiles = $state<Tile[]>(shuffle(picks.flatMap((f) => [{ key: f.id + 'q', id: f.id, text: f.q, side: 'q' as const }, { key: f.id + 'a', id: f.id, text: f.a, side: 'a' as const }])));

  let sel = $state<Tile | null>(null);
  let gone = $state<string[]>([]);
  let shake = $state('');
  let misses = $state(0);
  let start = performance.now();
  let secs = $state(0);
  let best = $state(0);
  let earned = $state(0);
  const done = $derived(gone.length === picks.length && picks.length > 0);

  $effect(() => {
    if (done) return;
    const id = setInterval(() => (secs = Math.floor((performance.now() - start) / 1000)), 250);
    return () => clearInterval(id);
  });

  async function tap(tile: Tile) {
    if (gone.includes(tile.id)) return;
    if (!sel || sel.side === tile.side) { sel = sel?.key === tile.key ? null : tile; return; }
    if (sel.id === tile.id) {
      gone = [...gone, tile.id];
      sel = null;
      await tick();
      if (gone.length === picks.length) finish();
    } else {
      misses++;
      shake = tile.key;
      setTimeout(() => { shake = ''; sel = null; }, 450);
    }
  }
  async function finish() {
    secs = Math.floor((performance.now() - start) / 1000);
    best = app.scores[KEY] ?? 0;
    if (!best || secs < best) await save('scores', { ...app.scores, [KEY]: secs });
    earned = await award('quiz', { score: picks.length / (picks.length + misses) });
  }
</script>

<div class="game">
  {#if picks.length < 4}
    <h1>Match Up</h1>
    <p class="notice">There are not enough short questions for your branch yet.</p>
  {:else if done}
    <div class="final">
      <p class="label">Match Up{mod ? ': ' + MODULES.find((m) => m.id === mod)?.name : ''}</p>
      <b class="big">{secs}s</b>
      <p>{misses} {misses === 1 ? 'miss' : 'misses'}{best && secs >= best ? `. Your best is ${best}s` : best ? ', a new best' : ''}.</p>
      {#if earned}<p class="xpline">+{earned} XP</p>{/if}
      <div class="row">
        <button class="btn primary" onclick={() => location.reload()}>Play again</button>
        <a class="btn" href="#/train">All games</a>
      </div>
    </div>
  {:else}
    <div class="hud"><span class="label">Tap a question, then its answer</span><span class="num">{secs}s</span></div>
    <div class="board" role="group" aria-label="Match Up board">
      {#each tiles as tile (tile.key)}
        <button class="mtile {tile.side}" class:sel={sel?.key === tile.key} class:gone={gone.includes(tile.id)} class:shake={shake === tile.key}
          aria-pressed={sel?.key === tile.key} disabled={gone.includes(tile.id)} onclick={() => tap(tile)}>
          <span class="sr">{tile.side === 'q' ? 'Question: ' : 'Answer: '}</span>{tile.text}
        </button>
      {/each}
    </div>
    <p class="help" role="status">{gone.length} of {picks.length} matched</p>
  {/if}
</div>
