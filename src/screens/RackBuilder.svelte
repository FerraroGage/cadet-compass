<script lang="ts">
  // Ribbon rack builder: choose ribbons, add devices, see the built rack and where it sits.
  import { app, save, facts } from '../lib/store.svelte';
  import { data, fmt, layoutRack } from '../lib/uniform';
  import Units from '../lib/Units.svelte';
  import Ribbon from '../lib/Ribbon.svelte';

  const R = data.rack;
  const ribbons = $derived(facts().filter((f) => f.group === 'ribbon' && f.order !== undefined).sort((a, b) => a.order! - b.order!));
  const chosen = $derived(ribbons.filter((f) => app.rack.ids.includes(f.id)));
  const rows = $derived(layoutRack(chosen.map((f) => f.id), R.perRow, R.topRow));
  const name = (id: string) => ribbons.find((f) => f.id === id)?.a ?? id;
  // True proportion: viewBox units are inches.
  const rw = R.ribbonWidth_in ?? 1.375, rh = R.ribbonHeight_in ?? 0.375, rg = R.rowGap_in ?? 0;
  const vw = R.perRow * rw;
  const vh = $derived(rows.length * rh + Math.max(0, rows.length - 1) * rg);
  const fs = (vw / 340) * 13; // about 13px once scaled to a phone-width card
  const num = (id: string) => chosen.findIndex((f) => f.id === id) + 1;
  const dev = (id: string) => R.devices.find((d) => d.id === id);

  const toggle = (id: string) => {
    const on = app.rack.ids.includes(id);
    save('rack', { ids: on ? app.rack.ids.filter((x) => x !== id) : [...app.rack.ids, id], devices: { ...app.rack.devices, [id]: on ? [] : (app.rack.devices[id] ?? []) } });
  };
  const setDevice = (id: string, dId: string) =>
    save('rack', { ...app.rack, devices: { ...app.rack.devices, [id]: dId ? [dId] : [] } });
  const gaps = [['Above the pocket', R.gapAbovePocket_in], ['Above the badge', R.gapAboveBadge_in], ['Between rows', R.rowGap_in]] as const;
</script>

<h1>Ribbon rack builder</h1>
<p class="help">Ribbon colors are not confirmed yet: the gray ribbons are placeholders, numbered to match the key.</p>
<p class="help">Switch on the ribbons you have earned. They are placed in order of precedence. Check the result with your Senior Marine Instructor.</p>
<Units />

<div class="block rackpage">
  <h2>Your rack</h2>
  {#if rows.length}
    <svg class="rack" viewBox="0 0 {vw} {vh}" role="img" aria-label="Ribbon rack, top row first: {rows.map((r) => r.filter(Boolean).map((i) => name(i!)).join(', ')).join('; then ')}">
      {#each rows as row, ri}
        {@const ids = row.filter((x): x is string => !!x)}
        {@const x0 = (ids.length < R.perRow ? (R.topRow === 'left' ? 0 : R.topRow === 'right' ? R.perRow - ids.length : (R.perRow - ids.length) / 2) : 0) * rw}
        {#each ids as id, ci}
          {@const x = x0 + ci * rw}
          {@const y = ri * (rh + rg)}
          <Ribbon name={name(id)} width={rw} height={rh} {x} {y} />
          <text x={x + rw / 2} y={y + fs * 0.9} text-anchor="middle" dominant-baseline="central" fill="var(--ink)" stroke="var(--sheet)" stroke-width={fs / 5} paint-order="stroke" font-size={fs * 0.8} font-weight="600">{num(id)}</text>
          {#each app.rack.devices[id] ?? [] as d}<circle cx={x + rw - rh * 0.17} cy={y + rh * 0.8} r={rh * 0.09} fill="var(--branch)"><title>{dev(d)?.name}</title></circle>{/each}
        {/each}
      {/each}
    </svg>
    <ol class="rkey">
      {#each chosen as f}<li>{f.a}{#each app.rack.devices[f.id] ?? [] as d} <span class="label">{dev(d)?.name}</span>{/each}</li>{/each}
    </ol>
  {:else}<p class="help">No ribbons chosen yet.</p>{/if}
  {#if !R.topRow}<p class="help">Check with your SMI how a short top row sits.</p>{/if}
  <div class="pocketline">Top edge of the pocket</div>
  <table>
    <thead><tr><th scope="col">Gap</th><th scope="col">Amount</th></tr></thead>
    <tbody>
      {#each gaps as [label, v]}{#if v !== null}<tr><td>{label}</td><td>{fmt(v, app.units)}</td></tr>{/if}{/each}
      {#if R.ribbonWidth_in !== null && R.ribbonHeight_in !== null}<tr><td>Each ribbon</td><td>{fmt(R.ribbonWidth_in, app.units)} wide, {fmt(R.ribbonHeight_in, app.units)} tall</td></tr>{/if}
    </tbody>
  </table>
  <p class="cite">Source: {data.sources[R.src]?.title ?? R.src}, {R.loc}.</p>
  <div class="row"><button class="btn primary" onclick={() => window.print()}>Print</button></div>
</div>

<h2>Ribbons <span class="label">{chosen.length} of {ribbons.length}</span></h2>
{#each ribbons as f (f.id)}
  {@const on = app.rack.ids.includes(f.id)}
  <div class="opt">
    <Ribbon name={f.a} width={44} />
    <span style="flex: 1">{f.a}</span>
    {#if on && R.devices.length}
      <select aria-label="Device for {f.a}" value={app.rack.devices[f.id]?.[0] ?? ''} onchange={(e) => setDevice(f.id, e.currentTarget.value)}>
        <option value="">No device</option>
        {#each R.devices as d}<option value={d.id}>{d.name}</option>{/each}
      </select>
    {/if}
    <button class="switch" role="switch" aria-checked={on} aria-label={f.a} onclick={() => toggle(f.id)}><i></i></button>
  </div>
{/each}
