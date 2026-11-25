<script module lang="ts">
  let last: 'enlisted' | 'officer' = 'enlisted'; // kept while switching service, which rebuilds the screen
</script>

<script lang="ts">
  // Rank Study: a rank chart by service and pay grade, junior first, with the ways to study it on top.
  import { RANKS, type Service } from '../lib/rankArt';
  import { facts } from '../lib/store.svelte';
  import RankInsignia from '../lib/RankInsignia.svelte';
  import Icon from '../lib/Icon.svelte';

  let { tab = 'cadet' }: { tab?: string } = $props();
  const TABS = [['cadet', 'Cadet'], ['usmc', 'Marines'], ['navy', 'Navy'], ['compare', 'Compare']];
  const NAMES: Record<string, string> = { usmc: 'Marine Corps', navy: 'Navy' };
  // svelte-ignore state_referenced_locally (the screen is rebuilt whenever the address changes)
  const view = TABS.some(([id]) => id === tab) ? tab : 'cadet';
  let kind = $state(last);
  $effect(() => { last = kind; });
  const services = (view === 'compare' ? ['usmc', 'navy'] : [view]) as Service[];
  /** Pay grades, junior first, each with the ranks of every service shown. Cadet ranks have no pay grade: one group. */
  const groups = $derived.by(() => {
    const all = services.map((s) => Object.entries(RANKS[s][kind]).map(([name, [art, abbr, pg]]) => ({ s, name, art, abbr, pg })));
    return [...new Set(all.flat().map((r) => r.pg))].map((pg) => ({ pg, cols: all.map((rs) => rs.filter((r) => r.pg === pg)) }));
  });
  const topic = $derived(`${NAMES[view]} ${kind} ranks`);
  const quiz = $derived(`#/train/quiz?module=ranks${view in NAMES ? '&topic=' + encodeURIComponent(topic) : ''}&n=10`);
  const art = $derived(view === 'cadet' ? 'cadet' : view);
  const source = facts().find((f) => f.group === `rank-${view === 'cadet' ? 'usmc' : view === 'compare' ? 'usmc' : view}-enlisted`);
</script>

<h1>Rank study</h1>
<nav class="tabs" aria-label="Rank set">
  {#each TABS as [id, name]}<a href="#/ranks/{id}" aria-current={view === id ? 'page' : undefined}>{name}</a>{/each}
</nav>
<div class="seg" role="group" aria-label="Enlisted or officer">
  <i class:right={kind === 'officer'}></i>
  <button aria-pressed={kind === 'enlisted'} onclick={() => (kind = 'enlisted')}>Enlisted</button>
  <button aria-pressed={kind === 'officer'} onclick={() => (kind = 'officer')}>Officer</button>
</div>

<div class="quick">
  <a href={quiz}><Icon name="quiz" /><span>Quiz</span></a>
  <a href="#/cards/ranks"><Icon name="cards" /><span>Cards</span></a>
  {#if view !== 'compare'}<a href="#/train/order/ranks?set={art}-{kind}"><Icon name="order" /><span>Order</span></a>{/if}
  <a href="#/train/speed?module=ranks"><Icon name="speed" /><span>Speed</span></a>
</div>

{#key kind}
  <div class="chart" class:two={view === 'compare'}>
    {#if view === 'compare'}<div class="heads"><b>Marine Corps</b><b>Navy</b></div>{/if}
    {#each groups as g, i (g.pg)}
      <section style="animation-delay: {Math.min(i, 8) * 35}ms" aria-label={g.pg || 'Cadet ranks'}>
        {#if g.pg}<h2>{g.pg}</h2>{/if}
        <div class="cols">
          {#each g.cols as col}
            <ul>
              {#each col as r (r.s + r.name)}
                <li class:wide={view === 'navy' && kind === 'officer'}>
                  {#if r.art}<RankInsignia rank={r.name} service={r.s} size={view === 'compare' ? 72 : r.s === 'navy' && kind === 'officer' ? 96 : 68} />{:else}<span class="none">No insignia</span>{/if}
                  <span class="nm"><b>{r.name}</b>{#if r.abbr}<small>{r.abbr}</small>{/if}</span>
                </li>
              {/each}
            </ul>
          {/each}
        </div>
      </section>
    {/each}
  </div>
{/key}

<p class="help">
  {#if view === 'cadet'}Cadet insignia are shown as collar pins: black for enlisted, silver for officers.
  {:else}Junior ranks first. Ranks in the same box share a pay grade.{/if}
  Your instructor's guidance comes first.
</p>
{#if source && view !== 'cadet'}<p class="cite">Ranks and pay grades: <a href={source.source.url} target="_blank" rel="noopener noreferrer">{source.source.title}</a>. Pictures: <a href="#/settings/legal">credits</a>.</p>
{:else}<p class="cite">Pictures: <a href="#/settings/legal">credits</a>.</p>{/if}

<style>
  .tabs { gap: 6px; }
  .tabs a { padding: 0 11px; font-size: 0.875rem; }
  .seg { position: relative; display: grid; grid-template-columns: 1fr 1fr; margin-top: calc(var(--u) * 1.5); padding: 4px; border-radius: 14px; background: var(--fill); }
  .seg i { position: absolute; inset: 4px auto 4px 4px; width: calc(50% - 4px); border-radius: 11px; background: var(--branch); box-shadow: 0 1px 4px #0003; transition: transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1); }
  .seg i.right { transform: translateX(100%); }
  .seg button { position: relative; min-height: 44px; border: 0; background: none; color: var(--ink-2); font: inherit; font-weight: 600; cursor: pointer; }
  .seg button[aria-pressed='true'] { color: #fff; }
  .quick { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: var(--u); margin-top: calc(var(--u) * 1.5); }
  .quick a { display: grid; justify-items: center; gap: 4px; padding: calc(var(--u) * 1.25) 4px; border-radius: var(--r); background: color-mix(in srgb, var(--branch) 10%, var(--sheet)); color: var(--ink); font-size: 0.8125rem; font-weight: 600; text-decoration: none; }
  .quick a :global(svg) { color: var(--accent); }
  .quick a:active { transform: scale(0.96); }

  /* The chart: a pay grade tab on top of a bordered box, one row per rank */
  .chart { margin-top: calc(var(--u) * 2); }
  .chart section { margin-top: calc(var(--u) * 1.5); animation: rise 0.35s var(--soft) backwards; }
  .chart h2 { display: inline-block; margin: 0; padding: 4px 14px; border-radius: 10px 10px 0 0; background: var(--navy); color: #fff; font-size: 0.9375rem; }
  .cols { border: var(--rule); border-radius: var(--r); background: var(--sheet); overflow: hidden; }
  .chart h2 + .cols { border-top-left-radius: 0; }
  .chart ul { list-style: none; margin: 0; padding: 0; }
  .chart li { display: flex; align-items: center; gap: calc(var(--u) * 2); margin: 0; padding: calc(var(--u) * 1.25) calc(var(--u) * 1.5); min-height: 84px; }
  .chart li + li { border-top: 1px solid var(--line); }
  .nm b { display: block; font-weight: 600; line-height: 1.25; }
  .nm small { color: var(--ink-2); font-size: 0.875rem; }
  .none { flex: none; display: grid; place-items: center; width: 68px; height: 68px; border: 1.5px dashed var(--line); border-radius: 14px; color: var(--ink-2); font-size: 0.6875rem; line-height: 1.2; text-align: center; }
  .two .cols { display: grid; grid-template-columns: 1fr 1fr; }
  .two ul + ul { border-left: 1px solid var(--line); }
  .two li { flex-direction: column; gap: var(--u); text-align: center; font-size: 0.875rem; }
  .heads { display: grid; grid-template-columns: 1fr 1fr; text-align: center; }
  .wide { min-height: 112px; }
</style>
