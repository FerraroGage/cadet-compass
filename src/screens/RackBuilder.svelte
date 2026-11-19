<script lang="ts">
  // Ribbon rack builder: choose ribbons, add devices, see the built rack and where it sits.
  import { tick } from 'svelte';
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
  const rw = 1.375, rh = 0.375, rg = 0.125; // drawing proportions only, not shown to the cadet
  const vw = R.perRow * rw;
  const vh = $derived(rows.length * rh + Math.max(0, rows.length - 1) * rg);
  const fs = (vw / 340) * 13; // about 13px once scaled to a phone-width card
  const num = (id: string) => chosen.findIndex((f) => f.id === id) + 1;
  const dev = (id: string) => R.devices.find((d) => d.id === id);
  const rd = (n: string) => R.ribbonDevices[n];
  const devOf = (id: string, n: string) => (rd(n) && dev(app.rack.devices[id]?.[0] ?? '') ? { metal: app.rack.devices[id][0], shape: rd(n).shape } : undefined);
  const devText = (id: string, n: string) => { const d = dev(app.rack.devices[id]?.[0] ?? ''), r = rd(n); return d && r ? `${d.name.replace(' device', '')} ${r.shape === 'bar' ? `“${r.label}” bar` : r.shape === 'lamp' ? 'Lamp of Learning' : 'Marine Corps emblem'}` : ''; };

  // The rack drawing above the list grows or shrinks when a ribbon is added, which would push the list under the
  // cadet's finger. Measure the tapped row before and after, and scroll by the difference so it stays still.
  const toggle = async (id: string, e?: Event) => {
    const row = (e?.currentTarget as HTMLElement | undefined)?.closest('.ribopt');
    const top = row?.getBoundingClientRect().top;
    await toggleNow(id);
    await tick();
    if (row && top !== undefined) scrollBy({ top: row.getBoundingClientRect().top - top, behavior: 'instant' });
  };
  const toggleNow = (id: string) => {
    const on = app.rack.ids.includes(id);
    save('rack', { ids: on ? app.rack.ids.filter((x) => x !== id) : [...app.rack.ids, id], devices: { ...app.rack.devices, [id]: on ? [] : (app.rack.devices[id] ?? []) } });
  };
  const setDevice = (id: string, dId: string) =>
    save('rack', { ...app.rack, devices: { ...app.rack.devices, [id]: dId ? [dId] : [] } });
  let q = $state(''), sort = $state<'prec' | 'az'>('prec');
  const shown = $derived((q.trim() ? ribbons.filter((f) => f.a.toLowerCase().includes(q.trim().toLowerCase())) : ribbons).slice().sort((a, b) => (sort === 'az' ? a.a.localeCompare(b.a) : a.order! - b.order!)));
  const enter = () => { if (shown.length === 1 && !app.rack.ids.includes(shown[0].id)) toggle(shown[0].id); };
  // Two taps instead of confirm(): some phone browsers and app views block or skip confirm dialogs, so Clear never ran.
  let arm = $state(false);
  let disarm: ReturnType<typeof setTimeout> | undefined;
  const clear = () => {
    if (!arm) { arm = true; clearTimeout(disarm); disarm = setTimeout(() => (arm = false), 4000); return; }
    arm = false;
    q = '';
    save('rack', { ids: [], devices: {} });
  };
  const gaps = [['Above the pocket', R.gapAbovePocket_in], ['Above the badge', R.gapAboveBadge_in]] as const;
</script>

<h1>Ribbon rack builder</h1>
<p class="help">Ribbon colors come from the cadet ribbon chart. A gray ribbon means its colors are not confirmed yet.</p>
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
          <Ribbon name={name(id)} width={rw} height={rh} {x} {y} device={devOf(id, name(id))} />
          <text x={x + rw / 2} y={y + fs * 0.9} text-anchor="middle" dominant-baseline="central" fill="var(--ink)" stroke="var(--sheet)" stroke-width={fs / 5} paint-order="stroke" font-size={fs * 0.8} font-weight="600">{num(id)}</text>
        {/each}
      {/each}
    </svg>
    <ol class="rkey">
      {#each chosen as f}<li><Ribbon name={f.a} width={72} device={devOf(f.id, f.a)} /><span>{f.a}{#if devText(f.id, f.a)}<small class="label" style="display: block">With {devText(f.id, f.a)}</small>{/if}</span></li>{/each}
    </ol>
  {:else}<p class="help">No ribbons chosen yet.</p>{/if}
  {#if !R.topRow}<p class="help">Check with your SMI how a short top row sits.</p>{/if}
  <div class="pocketline">Top edge of the pocket</div>
  <table>
    <thead><tr><th scope="col">Gap</th><th scope="col">Amount</th></tr></thead>
    <tbody>
      {#each gaps as [label, v]}{#if v !== null}<tr><td>{label}</td><td>{fmt(v, app.units)}</td></tr>{/if}{/each}
    </tbody>
  </table>
  <p class="cite">Source: {data.sources[R.src]?.title ?? R.src}, {R.loc}.</p>
  {#if chosen.some((f) => rd(f.a))}<p class="cite">Devices: {data.sources[R.devices[0].src]?.title}. Only a unit page supports this, so check with your SMI.</p>{/if}
  <div class="row"><button class="btn primary" onclick={() => window.print()}>Print</button></div>
</div>

<h2>Ribbons <span class="label">{chosen.length} of {ribbons.length}</span></h2>
<div class="rtools">
  <label>Search ribbons<input type="search" bind:value={q} onkeydown={(e) => e.key === 'Enter' && enter()} placeholder="Type a name" /></label>
  <label>Sort<select bind:value={sort}><option value="prec">Precedence</option><option value="az">A to Z</option></select></label>
  <button class="btn" class:danger={arm} onclick={clear} disabled={!app.rack.ids.length && !arm} aria-live="polite">{arm ? 'Tap again to clear all' : 'Clear'}</button>
</div>
{#if !shown.length}<p class="help">No ribbon matches.</p>{/if}
{#each shown as f (f.id)}
  {@const on = app.rack.ids.includes(f.id)}
  <div class="opt ribopt">
    <Ribbon name={f.a} width={72} device={devOf(f.id, f.a)} />
    <span class="ribname">{f.a}</span>
    {#if on && rd(f.a)}
      <select aria-label="Device for {f.a}" value={app.rack.devices[f.id]?.[0] ?? ''} onchange={(e) => setDevice(f.id, e.currentTarget.value)}>
        <option value="">No device</option>
        {#each R.devices as d}<option value={d.id}>{d.name}: {d.meaning}</option>{/each}
      </select>
    {/if}
    <button class="switch" role="switch" aria-checked={on} aria-label={f.a} onclick={(e) => toggle(f.id, e)}><i></i></button>
  </div>
{/each}

<style>
  /* The device menu sits on its own line under the name, so long names never squeeze. */
  /* A fixed grid: ribbon, name, switch on the first row; the device menu, when shown, on a second row.
     The switch never moves when a ribbon is turned on. */
  .ribopt { display: grid; grid-template-columns: 72px 1fr auto; align-items: center; column-gap: calc(var(--u) * 1.5); }
  .ribopt .ribname { min-width: 0; }
  .ribopt .switch { grid-column: 3; grid-row: 1; }
  .ribopt select { grid-column: 2 / 4; grid-row: 2; margin: 0 0 var(--u); width: auto; }
  .rtools { display: flex; flex-wrap: wrap; align-items: end; gap: 8px; margin-bottom: 8px; }
  .rtools label { display: flex; flex-direction: column; gap: 2px; font-size: 0.8125rem; color: var(--ink-2); flex: 1 1 140px; }
  .rtools input, .rtools select { min-height: 44px; font-size: 1rem; width: 100%; }
  .rtools .btn { min-height: 44px; }
</style>
