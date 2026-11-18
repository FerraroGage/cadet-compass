<script lang="ts">
  // "Not in my program": hides this item from every quiz, card and game. It earns nothing, and an answer
  // already given to it stops counting. Hidden items are listed in Settings, where they can be turned back on.
  // `after`: the question was already answered (wrong), so the wording says it will not count.
  let { onskip, after = false }: { onskip: () => void; after?: boolean } = $props();
</script>

<button class="skip" type="button" onclick={onskip}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>
  {after ? 'Not in my program? Don’t count it' : 'Not in my program? Skip it'}
</button>
