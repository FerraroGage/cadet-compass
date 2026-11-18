<script lang="ts">
  // Placement guide: where each item goes on the uniform, with the measures and the page they came from.
  import { app } from '../lib/store.svelte';
  import { data, fmt } from '../lib/uniform';
  import Diagram from '../lib/Diagram.svelte';
  import Units from '../lib/Units.svelte';
  import UniformOutline from '../lib/UniformOutline.svelte';

  let pick = $state(data.uniforms[0]?.id ?? '');
  const uni = $derived(data.uniforms.find((u) => u.id === pick));
  const cites = (ms: { src: string; loc: string }[]) => [...new Map(ms.map((m) => [m.src + m.loc, m])).values()];
</script>

<h1>Placement guide</h1>
<p class="help">Where each item goes, in plain measures. Your Senior Marine Instructor and your unit's orders come first.</p>
<Units />

<div class="chips" role="group" aria-label="Uniform">
  {#each data.uniforms as u}
    <button class="btn" aria-pressed={pick === u.id} onclick={() => (pick = u.id)}>{u.name}</button>
  {/each}
</div>

{#if uni}
  <UniformOutline id={uni.id} />
  {#each uni.items as item, k (item.id + k)}
    <details class="fold">
      <summary>{item.name}{#if item.confidence === 'verify'}<span class="tag">Check with your SMI</span>{/if}</summary>
      <div class="block foldbody">
        <p>{item.where}.</p>
        <Diagram {item} units={app.units} />
        {#if item.measures.length}
          <table>
            <thead><tr><th scope="col">Measure</th><th scope="col">Amount</th><th scope="col">From</th></tr></thead>
            <tbody>
              {#each item.measures as m}
                <tr><td>{m.label}</td><td>{m.in === null ? (m.text ?? '') : fmt(m.in, app.units)}</td><td>{m.from ?? ''}</td></tr>
              {/each}
            </tbody>
          </table>
        {/if}
        {#if item.notes.length}<ul>{#each item.notes as n}<li>{n}</li>{/each}</ul>{/if}
      </div>
      <p class="cite">
        {#each cites(item.measures) as c, i}{i ? '; ' : 'Source: '}{data.sources[c.src]?.title ?? c.src}, {c.loc}{/each}{item.measures.length ? '.' : ''}
      </p>
    </details>
  {/each}
{/if}
