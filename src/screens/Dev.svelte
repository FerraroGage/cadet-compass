<script lang="ts">
  // Developer tools. Only reachable once dev mode is on (Settings > About, tap the version seven times).
  import { app, facts, save, today, level, xpTotal, effectiveWeights, repoWeights } from '../lib/store.svelte';
  import { MODULES, quizzable, pickWeighted, weightOf, type Weights } from '../lib/quiz';
  import type { Module } from '../lib/bundle';

  const w = $derived<Weights>(app.weightsOverride ?? repoWeights);
  const all = $derived(facts(true));
  const modW = (m: Module) => w.modules[m] ?? 1;
  const topics = (m: Module) => [...new Set(all.filter((f) => f.module === m).map((f) => f.topic))].sort();
  const setMod = (m: Module, v: number) => save('weightsOverride', { ...w, modules: { ...w.modules, [m]: v } });
  function setTopic(m: Module, t: string, v: number | null) {
    const next = { ...w.topics };
    if (v === null) delete next[`${m}|${t}`]; else next[`${m}|${t}`] = v;
    save('weightsOverride', { ...w, topics: next });
  }
  const json = $derived(JSON.stringify({ version: 1, note: repoWeights.note, modules: w.modules, topics: w.topics }, null, 2));
  const reset = () => save('weightsOverride', null);

  const quiz = $derived(all.filter((f) => quizzable(f, today())));
  const chance = (m: Module) => {
    const tot = quiz.reduce((s, f) => s + weightOf(f, w), 0);
    return tot ? Math.round((quiz.filter((f) => f.module === m).reduce((s, f) => s + weightOf(f, w), 0) / tot) * 100) : 0;
  };

  let copied = $state('');
  async function copy() {
    try { await navigator.clipboard.writeText(json); copied = 'Copied'; }
    catch {
      const ta = document.createElement('textarea');
      ta.value = json; document.body.append(ta); ta.select();
      copied = document.execCommand('copy') ? 'Copied' : 'Copy failed';
      ta.remove();
    }
  }
  function download() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = 'question-weights.json'; a.click(); URL.revokeObjectURL(a.href);
  }

  let sim = $state<{ mod: [string, number][]; top: [string, number][] } | null>(null);
  function draw() {
    const picks = pickWeighted(quiz, 200, effectiveWeights());
    const count = (key: (f: (typeof picks)[number]) => string) => {
      const m = new Map<string, number>();
      for (const f of picks) m.set(key(f), (m.get(key(f)) ?? 0) + 1);
      return [...m].sort((a, b) => b[1] - a[1]);
    };
    sim = { mod: count((f) => f.module), top: count((f) => `${f.module} / ${f.topic}`).slice(0, 10) };
  }
  const pct = (n: number, of: number) => Math.round((n / of) * 100) + '%';

  const verify = $derived(all.filter((f) => f.confidence === 'verify'));
  let xp = $state(''), lvl = $state(''), msg = $state('');
  async function setXp() {
    const target = Number(xp);
    if (xp === '' || !Number.isFinite(target) || target < 0) return;
    // An old-dated event so daily caps and the streak are untouched.
    await save('ledger', [...app.ledger, { id: crypto.randomUUID(), kind: 'lesson', day: '1970-01-01', pts: target - xpTotal() }]);
    msg = `XP is now ${xpTotal()} (level ${level().level}) on this device.`;
  }
  const setLevel = () => { const n = Number(lvl); if (n >= 1) { xp = String(25 * (n - 1) * (n + 2)); return setXp(); } };
  async function clearGoal() {
    await save('days', { ...app.days, [today()]: 0 });
    await save('ledger', app.ledger.filter((e) => !(e.kind === 'goal' && e.day === today())));
    msg = 'Daily goal for today cleared.';
  }
</script>

<h1>Dev tools</h1>
<p class="label">Turn off: tap the app version in Settings > About seven times.</p>

<details class="fold" open>
  <summary>Question weights</summary>
  <div style="padding: 0 16px 16px">
    <p class="help">0 = never asked, 1 = normal, 2 = twice as likely. Changes save on this device straight away and apply while dev mode is on.</p>
    {#each MODULES as m (m.id)}
      <div class="block" style="padding: 12px 16px">
        <label style="display: block; font-weight: 600">{m.name}: {modW(m.id)}
          <input type="range" min="0" max="5" step="0.5" value={modW(m.id)} style="width: 100%; height: 44px" oninput={(e) => setMod(m.id, +e.currentTarget.value)} />
        </label>
        <p class="help">Chance of next question coming from this module: {chance(m.id)}%</p>
        <details class="fold">
          <summary>Topics<span class="label">{topics(m.id).length}</span></summary>
          <div style="padding: 0 16px 12px">
            {#each topics(m.id) as t}
              {@const own = w.topics[`${m.id}|${t}`]}
              <label style="display: block; margin-top: 8px">{t}: {own ?? `inherit (${modW(m.id)})`}
                <input type="range" min="0" max="5" step="0.5" value={own ?? modW(m.id)} style="width: 100%; height: 44px" oninput={(e) => setTopic(m.id, t, +e.currentTarget.value)} />
              </label>
              {#if own !== undefined}<button class="btn link" onclick={() => setTopic(m.id, t, null)}>Inherit module</button>{/if}
            {/each}
          </div>
        </details>
      </div>
    {/each}
    <div class="row">
      <button class="btn" onclick={reset}>Reset to repo defaults</button>
      <button class="btn" onclick={copy}>Copy JSON</button>
      <button class="btn" onclick={download}>Download weights.json</button>
    </div>
    {#if copied}<p class="help" role="status">{copied}</p>{/if}
    <p class="help">To make these the default for everyone: tap Copy JSON, paste it into <code>src/data/question-weights.json</code> in the repo, then commit.</p>
  </div>
</details>

<details class="fold">
  <summary>Draw simulator</summary>
  <div style="padding: 0 16px 16px">
    <button class="btn primary" onclick={draw}>Draw 200 questions</button>
    {#if sim}
      <table>
        <thead><tr><th scope="col">Module</th><th scope="col">Count</th><th scope="col">Percent</th></tr></thead>
        <tbody>{#each sim.mod as [k, n]}<tr><td>{k}</td><td>{n}</td><td>{pct(n, 200)}</td></tr>{/each}</tbody>
      </table>
      <table>
        <thead><tr><th scope="col">Top 10 topics</th><th scope="col">Count</th><th scope="col">Percent</th></tr></thead>
        <tbody>{#each sim.top as [k, n]}<tr><td>{k}</td><td>{n}</td><td>{pct(n, 200)}</td></tr>{/each}</tbody>
      </table>
    {/if}
  </div>
</details>

<details class="fold">
  <summary>Content check<span class="label">{verify.length} to verify</span></summary>
  <div style="padding: 0 16px 16px">
    <table>
      <thead><tr><th scope="col">Module / topic</th><th scope="col">Facts</th></tr></thead>
      <tbody>
        {#each MODULES as m}
          <tr><td><strong>{m.name}</strong></td><td><strong>{all.filter((f) => f.module === m.id).length}</strong></td></tr>
          {#each topics(m.id) as t}<tr><td>&nbsp;&nbsp;{t}</td><td>{all.filter((f) => f.module === m.id && f.topic === t).length}</td></tr>{/each}
        {/each}
      </tbody>
    </table>
    <h2>Marked verify</h2>
    {#if verify.length}<ul>{#each verify as f}<li><code>{f.id}</code></li>{/each}</ul>{:else}<p class="help">None.</p>{/if}
  </div>
</details>

<details class="fold">
  <summary>Progress tools</summary>
  <div style="padding: 0 16px 16px">
    <p class="help">These write this device's local XP ledger only. Server XP is unaffected, and a signed-in total may replace it on the next sync.</p>
    <p>Now: {xpTotal()} XP, level {level().level}</p>
    <label class="field"><span class="label">Set XP</span><input type="number" min="0" bind:value={xp} /></label>
    <button class="btn" onclick={setXp}>Set XP</button>
    <label class="field"><span class="label">Set level</span><input type="number" min="1" bind:value={lvl} /></label>
    <button class="btn" onclick={setLevel}>Set level</button>
    <div class="row" style="margin-top: 12px"><button class="btn" onclick={clearGoal}>Clear today's daily goal</button></div>
    {#if msg}<p class="help" role="status">{msg}</p>{/if}
  </div>
</details>
