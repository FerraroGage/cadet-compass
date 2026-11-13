<script lang="ts">
  import { facts } from '../lib/store.svelte';
  // Drill metronome. Clicks are scheduled on the audio clock a little ahead of time, so the beat does not drift
  // the way a plain timer does.
  import { app } from '../lib/store.svelte';
  import Cite from '../lib/Cite.svelte';

  const TEMPOS = [
    { bpm: 60, name: 'Slow time' },
    { bpm: 112, name: '112' },
    { bpm: 120, name: 'Quick time' },
    { bpm: 180, name: 'Double time' },
  ];
  const source = facts().find((f) => f.id === 'usmc.drill.quick-time');

  let bpm = $state(120);
  let running = $state(false);
  let beat = $state(0); // counts steps; odd is left, even is right
  let ctx: AudioContext | undefined;
  let next = 0;

  function click(at: number) {
    const osc = ctx!.createOscillator(), gain = ctx!.createGain();
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.5, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.04);
    osc.connect(gain).connect(ctx!.destination);
    osc.start(at);
    osc.stop(at + 0.05);
    setTimeout(() => { if (running) beat++; }, Math.max(0, (at - ctx!.currentTime) * 1000));
  }
  $effect(() => {
    if (!running) return;
    ctx ??= new AudioContext();
    ctx.resume();
    next = ctx.currentTime + 0.1;
    beat = 0;
    const id = setInterval(() => {
      while (next < ctx!.currentTime + 0.1) { click(next); next += 60 / bpm; }
    }, 25);
    return () => clearInterval(id);
  });
</script>

<h1>Drill metronome</h1>

<div class="block">
  <div class="head"><span class="n">1</span><span class="t">Cadence: {bpm} steps per minute</span></div>
  <div class="in">
    <div class="row fill" style="margin-top: 0" role="group" aria-label="Cadence">
      {#each TEMPOS as tempo}
        <button class="btn" class:primary={bpm === tempo.bpm} aria-pressed={bpm === tempo.bpm} onclick={() => (bpm = tempo.bpm)}>{tempo.bpm}</button>
      {/each}
    </div>
    <p class="label" style="margin-top: 8px">{TEMPOS.find((x) => x.bpm === bpm)?.name}</p>
    <div class="feet" aria-hidden="true">
      <span class:on={running && beat % 2 === 1}>Left</span>
      <span class:on={running && beat > 0 && beat % 2 === 0}>Right</span>
    </div>
    <div class="row">
      <button class="btn primary" onclick={() => (running = !running)}>{running ? 'Stop' : 'Start'}</button>
      <a class="btn" href="#/train">Training menu</a>
    </div>
  </div>
</div>

<h2>Cadences</h2>
<table>
  <thead><tr><th class="num" scope="col">Steps</th><th scope="col">Name</th></tr></thead>
  <tbody>
    <tr><td class="num">60</td><td>Slow time</td></tr>
    <tr><td class="num">112 to 120</td><td>Quick time, the normal marching cadence</td></tr>
    <tr><td class="num">180</td><td>Double time</td></tr>
  </tbody>
</table>
{#if source}<Cite fact={source} />{/if}
<p class="help" style="margin-top: 8px">The Marine Corps drill manual (MCO 5060.20) sets quick time at 112 to 120 steps per minute, so both settings are in standard. The left and right markers only show alternate steps.</p>

<style>
  .feet { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
  .feet span { border: var(--rule); border-radius: var(--r); background: var(--sheet); min-height: 72px; display: grid; place-items: center; font-weight: 600; color: var(--ink-2); }
  .feet span.on { background: var(--branch); border-color: var(--branch); color: var(--on-branch); }
</style>
