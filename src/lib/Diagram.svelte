<script lang="ts">
  import { fmt, type UItem, type Units } from './uniform';
  let { item, units }: { item: UItem; units: Units } = $props();

  const rows = $derived(item.measures.map((m) => ({ ...m, val: m.in === null ? (m.text ?? '') : fmt(m.in, units) })));
  const h = $derived(Math.max(250, 40 + rows.length * 50));
  const aria = $derived(`Diagram of ${item.name}, ${item.where}. ${rows.map((r) => `${r.label}: ${r.val}`).join('. ')}`);
  // Dimension bars are drawn in proportion to the distance, within a readable range.
  const len = (v: number | null) => (v === null ? 0 : Math.min(90, Math.max(14, v * 30)));
</script>

<svg viewBox="0 0 400 {h}" role="img" aria-label={aria} class="diagram">
  <g transform="scale(1.4)" fill="var(--sheet)" stroke="var(--ink-2)" stroke-width="1.5" stroke-linejoin="round">
    {#if item.region === 'left-pocket' || item.region === 'right-pocket'}
      <rect x="20" y="60" width="110" height="90" rx="4" />
      <path d="M20 60h110v22l-55 14-55-14z" fill="var(--line)" />
      <rect x="35" y="22" width="80" height="22" rx="2" stroke-dasharray="5 4" fill="none" stroke="var(--branch)" />
    {:else if item.region === 'collar'}
      <path d="M20 40l50 20 50-20v60l-50 30-50-30z" />
      <path d="M70 60v70" fill="none" />
    {:else if item.region === 'sleeve'}
      <rect x="35" y="20" width="80" height="140" rx="6" />
      <path d="M35 60h80" stroke-dasharray="5 4" fill="none" />
    {:else}
      <rect x="15" y="70" width="120" height="30" rx="3" />
      <rect x="62" y="64" width="26" height="42" rx="3" fill="var(--line)" />
    {/if}
  </g>
  {#each rows as r, i}
    {@const y = 40 + i * 50}
    {@const l = len(r.in) || 14}
    <g stroke="var(--branch)" stroke-width="2.5" fill="none">
      <path d="M284 {y}h{l}M284 {y - 7}v14M{284 + l} {y - 7}v14" />
    </g>
    <circle cx="258" cy={y} r="13" fill="var(--branch)" />
    <text x="258" y={y + 5} text-anchor="middle" fill="var(--on-branch)" font-size="15" font-weight="700">{i + 1}</text>
  {/each}
</svg>
<ol class="dkey" aria-hidden="true">
  {#each rows as r}<li><b>{r.label}: {r.val}</b>{#if r.from}<span>from {r.from}</span>{/if}</li>{/each}
</ol>
