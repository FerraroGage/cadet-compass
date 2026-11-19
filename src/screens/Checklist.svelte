<script lang="ts">
  // Inspection checklist: lines for the chosen uniform, ticked off and kept on this device.
  import { term } from '../lib/terms';
  import { app, save } from '../lib/store.svelte';
  import { data } from '../lib/uniform';

  let pick = $state(data.uniforms[0]?.id ?? '');
  const lines = $derived(data.checklist.filter((l) => l.uniforms.includes('*') || l.uniforms.includes(pick)));
  const done = $derived(app.checks[pick] ?? []);
  const flip = (id: string) =>
    save('checks', { ...app.checks, [pick]: done.includes(id) ? done.filter((d) => d !== id) : [...done, id] });
  const clear = () => save('checks', { ...app.checks, [pick]: [] });
</script>

<h1>Inspection checklist</h1>
<div class="chips" role="group" aria-label="Uniform">
  {#each data.uniforms as u}
    <button class="btn" aria-pressed={pick === u.id} onclick={() => (pick = u.id)}>{term(u.name)}</button>
  {/each}
</div>

<div class="block checklist">
  <p class="label">{lines.filter((l) => done.includes(l.id)).length} of {lines.length} checked</p>
  {#each lines as l (l.id)}
    <label class="opt">
      <input type="checkbox" checked={done.includes(l.id)} onchange={() => flip(l.id)} />
      <span>{term(l.text)}<small>{data.sources[l.src]?.title ?? l.src}, {l.loc}</small></span>
    </label>
  {/each}
</div>
<div class="row">
  <button class="btn" onclick={clear}>Clear</button>
  <button class="btn" onclick={() => window.print()}>Print</button>
</div>
