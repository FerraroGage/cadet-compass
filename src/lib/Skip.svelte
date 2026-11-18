<script lang="ts">
  // "Not in my program": hides this item from every quiz, card and game. It earns nothing.
  // Hidden items are listed in Settings, where they can be turned back on.
  let { onskip }: { onskip: () => void } = $props();
</script>

<button class="btn link skip" type="button" onclick={onskip}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>
  Not in my program, skip it
</button>
