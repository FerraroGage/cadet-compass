<script lang="ts">
  // Rank Study: one ladder per rank set, with the ways to study it.
  import { facts } from '../lib/store.svelte';
  import { CADET_RANKS } from '../lib/cadetRanks';
  import RankInsignia from '../lib/RankInsignia.svelte';

  const all = facts();
  const ladder = (group: string) => all.filter((f) => f.group === group && f.order).sort((a, b) => a.order! - b.order!);
  const grades = (kind: string, branch: string) => new Map(all.filter((f) => f.group === `paygrade-${branch}-${kind}`).map((f) => [f.q.match(/(?:a|an) (.+)\?/)?.[1] ?? '', f.a]));
  /** Pay grade for a rank fact: from its text, else from the pay-grade facts. */
  const grade = (title: string, text: string, pg: Map<string, string>) => text.match(/\b[EOW]-\d{1,2}\b/)?.[0] ?? pg.get(title) ?? '';
  const ladderOf = (branch: string, kind: string) => ladder(`rank-${branch}-${kind}`).map((f) => ({ name: f.a, pg: grade(f.a, f.text ?? '', grades(kind, branch)) }));

  const TOPIC: Record<string, string> = { usmc: 'Marine Corps', navy: 'Navy' };
  const SETS = $derived({
    'cadet-enlisted': CADET_RANKS.slice(6).map((name) => ({ name, pg: '' })),
    'cadet-officer': CADET_RANKS.slice(0, 6).map((name) => ({ name, pg: '' })),
    'usmc-enlisted': ladderOf('usmc', 'enlisted'), 'usmc-officer': ladderOf('usmc', 'officer'),
    'navy-enlisted': ladderOf('navy', 'enlisted'), 'navy-officer': ladderOf('navy', 'officer'),
  } as Record<string, { name: string; pg: string }[]>);
  const CHIPS = $derived([['cadet-enlisted', 'Cadet enlisted'], ['cadet-officer', 'Cadet officer'], ['usmc', 'Marine Corps'], ['navy', 'Navy']].filter(([id]) => id.startsWith('cadet') || SETS[id + '-enlisted'].length || SETS[id + '-officer'].length));
  let chip = $state('cadet-enlisted');
  let kind = $state('enlisted');
  const key = $derived(chip.startsWith('cadet') ? chip : `${chip}-${kind}`);
  const rows = $derived(SETS[key] ?? []);
  const cadet = $derived(chip.startsWith('cadet'));
  const topic = $derived(`${TOPIC[chip]} ${kind} ranks`);
</script>

<h1>Rank study</h1>
<div class="chips" role="group" aria-label="Rank set">
  {#each CHIPS as [id, name]}<button class="setchip" aria-pressed={chip === id} onclick={() => (chip = id)}>{name}</button>{/each}
</div>
{#if !cadet}
  <div class="chips" role="group" aria-label="Enlisted or officer">
    {#each ['enlisted', 'officer'] as k}<button class="setchip" aria-pressed={kind === k} onclick={() => (kind = k)}>{k === 'enlisted' ? 'Enlisted' : 'Officer'}</button>{/each}
  </div>
{/if}

{#if rows.length}
  <ol class="ladder">
    {#each rows as r}
      <li>{#if cadet}<span class="ins">{#if r.name !== 'Cadet Private'}<RankInsignia rank={r.name} size={40} />{/if}</span>{/if}<span class="nm">{r.name}</span>{#if r.pg}<span class="label">{r.pg}</span>{/if}</li>
    {/each}
  </ol>
{:else}
  <p class="notice">This set is not published yet.</p>
{/if}

<h2>Study this set</h2>
<div class="actions">
  <a class="act" href="#/cards/ranks"><b>Flip cards</b><small>Study ranks, a few cards at a time</small></a>
  <a class="act" href="#/train/quiz?module=ranks{cadet ? '' : '&topic=' + encodeURIComponent(topic)}&n=10"><b>Quiz</b><small>10 questions on ranks</small></a>
  <a class="act" href="#/train/order/ranks?set={key}"><b>Put in order</b><small>Seniority Ladder, senior first</small></a>
  <a class="act" href="#/train/speed?module=ranks"><b>Speed Round</b><small>Beat the clock on ranks</small></a>
</div>

<style>
  .chips { display: flex; flex-wrap: wrap; gap: var(--u); margin-top: calc(var(--u) * 2); }
  .setchip { min-height: 44px; padding: 0 calc(var(--u) * 2); border: var(--rule); border-radius: 99px; background: var(--sheet); color: var(--ink); font: inherit; font-size: 0.9375rem; font-weight: 500; cursor: pointer; }
  .setchip[aria-pressed='true'] { background: var(--branch); border-color: var(--branch); color: #fff; }
  .ladder { list-style: none; padding: 0; margin: calc(var(--u) * 2) 0 0; }
  .ladder li { display: flex; align-items: center; gap: calc(var(--u) * 1.5); min-height: 48px; border-bottom: var(--rule); }
  .ins { width: 40px; height: 40px; flex: none; display: inline-flex; align-items: center; justify-content: center; }
  .nm { flex: 1; font-weight: 500; }
</style>
