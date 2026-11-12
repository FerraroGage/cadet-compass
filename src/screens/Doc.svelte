<script lang="ts">
  import type { LegalDoc } from '../legal/terms';
  let { title, doc }: { title: string; doc: LegalDoc } = $props();
</script>

<!-- Plain text only. Nothing here is rendered as HTML, so there is nothing to sanitize. -->
<h2>{title}</h2>
<p class="label">Last updated {doc.date}</p>
{#each doc.sections as s}
  <h3>{s.h}</h3>
  {#each s.body as b}
    {#if typeof b === 'string'}<p>{b}</p>{:else}<ul>{#each b as li}<li>{li}</li>{/each}</ul>{/if}
  {/each}
{/each}
