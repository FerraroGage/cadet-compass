<script lang="ts">
  import { app, save } from './store.svelte';
</script>

<div class="units" role="group" aria-label="Units">
  {#each ['in', 'cm'] as const as u}
    <button class="btn" aria-pressed={app.units === u} onclick={() => save('units', u)}>{u === 'in' ? 'Inches' : 'Centimeters'}</button>
  {/each}
</div>
