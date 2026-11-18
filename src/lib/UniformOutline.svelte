<script lang="ts">
  // Front-view outline of the uniform top, in theme colors. Generic shape: no emblems, no measurements implied.
  import { data } from './uniform';
  let { id }: { id: string } = $props();
  const u = $derived(data.uniforms.find((x) => x.id === id));
  const kind = $derived(id.startsWith('blue') || id === 'service-a' ? 'coat' : id === 'utility' ? 'utility' : 'shirt');
  const body = 'M60 30 L35 40 L8 120 L28 128 L45 95 L45 215 L155 215 L155 95 L172 128 L192 120 L165 40 L140 30';
</script>

<svg class="uo" viewBox="0 0 200 230" role="img" aria-label="{u?.name ?? 'Uniform'} outline, front view">
  <path d={body} fill="var(--sheet)" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round" />
  <path d="M60 30 L100 70 L140 30" fill="var(--fill)" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round" />
  <path d="M60 30 L82 22 L100 36 L118 22 L140 30" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round" />
  <line x1="100" y1="70" x2="100" y2="215" stroke="var(--line)" stroke-width="2" />
  {#if kind !== 'shirt'}<path d="M100 70 L112 150 L100 150" fill="none" stroke="var(--line)" stroke-width="2" />{/if}
  <rect x="56" y="88" width="30" height="32" rx="2" fill="none" stroke="var(--branch)" stroke-width="2" />
  <rect x="114" y="88" width="30" height="32" rx="2" fill="none" stroke="var(--branch)" stroke-width="2" />
  {#if kind === 'coat'}
    <rect x="52" y="150" width="36" height="6" fill="none" stroke="var(--branch)" stroke-width="2" /><rect x="112" y="150" width="36" height="6" fill="none" stroke="var(--branch)" stroke-width="2" />
  {/if}
  {#if kind === 'utility'}<rect x="52" y="150" width="40" height="30" rx="2" fill="none" stroke="var(--branch)" stroke-width="2" /><rect x="108" y="150" width="40" height="30" rx="2" fill="none" stroke="var(--branch)" stroke-width="2" />{/if}
</svg>

<style>
  .uo { display: block; margin: 0 auto 0.75rem; width: min(220px, 60%); height: auto; }
</style>
