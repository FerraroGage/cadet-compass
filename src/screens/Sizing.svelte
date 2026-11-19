<script lang="ts">
  // Sizing calculator. Only the utility uniform has an official body-measurement size table; everything else shows how to measure.
  import { app, save } from '../lib/store.svelte';
  import Units from '../lib/Units.svelte';
  import d from '../data/usmc-sizing.json';

  type Row = [string, number | null, number | null];
  let cut = $state<'male' | 'female'>(app.cut);
  let v = $state({ chest: '', waist: '', height: '', inseam: '' });
  const inch = (s: string) => { const n = parseFloat(s); return n > 0 ? (app.units === 'cm' ? n / 2.54 : n) : null; };
  const unit = $derived(app.units);
  const fmt = (n: number) => (unit === 'cm' ? Math.round(n * 2.54) + ' cm' : n + ' in');
  const range = (r: Row) => (r[1] === null ? `up to ${fmt(r[2]!)}` : r[2] === null ? `over ${fmt(r[1])}` : `${fmt(r[1])} to ${fmt(r[2])}`);
  // Rows whose range holds the value; two matches means it sits on a boundary.
  const pick = (rows: Row[], n: number | null) => (n === null ? [] : rows.filter((r) => (r[1] === null || n >= r[1]) && (r[2] === null || n <= r[2])));
  const t = $derived(d.tables[cut] as unknown as Record<string, Row[]>);
  const out = $derived([
    ['Utility coat size', t.blouse_chest, inch(v.chest), 'chest'],
    ['Utility coat length', t.blouse_length_by_height, inch(v.height), 'height'],
    ['Utility trouser size', t.trouser_waist, inch(v.waist), 'waist'],
    ['Utility trouser length', t.trouser_inseam, inch(v.inseam), 'inseam'],
  ] as [string, Row[], number | null, string][]);
  const guide = ['chest', 'waist', 'neck', 'sleeve', 'inseam', 'height', 'head'] as const;
  const dressItems = ['Service coat', 'Blue dress coat', 'Khaki shirt', 'Service and dress trousers', 'Cover (hat)'];
  const fit = d.fit;
</script>

<h1>Sizing calculator</h1>
<p class="label">Measure yourself, then see the official size for the utility uniform. Always try it on; your unit's supply NCO has the final say.</p>

<div class="chips" role="group" aria-label="Cut">
  {#each ['male', 'female'] as const as c}
    <button class="btn" aria-pressed={cut === c} onclick={() => { cut = c; save('cut', c); }}>{c === 'male' ? 'Male cut' : 'Female cut'}</button>
  {/each}
</div>
<Units />

<div class="block">
  {#each [['chest', cut === 'female' ? 'Bust' : 'Chest'], ['waist', 'Waist'], ['height', 'Height'], ['inseam', 'Inseam']] as [k, label]}
    <label class="opt"><span>{label} ({unit})</span>
      <input type="number" inputmode="decimal" min="0" step="0.25" bind:value={v[k as 'chest']} />
    </label>
  {/each}
</div>

<h2>Utility uniform (cammies)</h2>
{#each out as [name, rows, n, key]}
  {@const m = pick(rows, n)}
  <div class="block">
    <strong>{name}</strong>:
    {#if n === null}<span class="help">Enter your {key} above.</span>
    {:else if m.length === 0}<span>Outside the printed range. Ask your supply NCO about a special measurement order.</span>
    {:else}<b>{m.map((r) => r[0]).join(' or ')}</b>{#if m.length > 1} <span class="help">(on the line between two sizes; try both)</span>{/if}
    {/if}
    <small class="help">{rows.map((r) => `${r[0]} ${range(r)}`).join('; ')}</small>
    <small class="help">Source: {d.sources.mccuu.name.split(',')[0]}, para 3.4.3.2.2.</small>
  </div>
{/each}
<p class="help">{fit.utility.text} ({fit.utility.source})</p>

<h2>Everything else</h2>
{#each dressItems as it}
  <div class="block">
    <strong>{it}</strong>
    <p>No official size table is published for cadets. Your unit's supply NCO fits this item.</p>
    <small class="help">
      {#if it === 'Service coat'}{cut === 'male' ? fit.service_coat_male.text + ' ' + fit.service_coat_male.source : fit.coats_female.text + ' ' + fit.coats_female.source}
      {:else if it === 'Blue dress coat'}{cut === 'male' ? fit.blue_dress_coat_male.text + ' ' + fit.blue_dress_coat_male.source : fit.coats_female.text + ' ' + fit.coats_female.source}
      {:else if it === 'Service and dress trousers'}{cut === 'male' ? fit.service_dress_trousers_male.text + ' ' + fit.service_dress_trousers_male.source : 'Measure waist and inseam below.'}
      {:else if it === 'Khaki shirt'}Measure neck and sleeve below.
      {:else}{d.measure.head.text} ({d.measure.head.source}){/if}
    </small>
  </div>
{/each}

<h2>How to measure</h2>
<p class="help">{d.measure.basics.text} ({d.measure.basics.source})</p>
<ul>
  {#each guide as g}
    <li><b>{g[0].toUpperCase() + g.slice(1)}</b>: {d.measure[g].text} <small class="help">({d.measure[g].source})</small></li>
  {/each}
</ul>
<p class="help">Sources: DLA Troop Support measuring booklet; MIL-PRF-MCCUU E (DLA Troop Support); MCO 1020.34H.</p>
