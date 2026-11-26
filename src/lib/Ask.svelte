<script lang="ts">
  // A question's prompt: its text, or a rank insignia or ribbon to name when the question carries a picture.
  import { term } from './terms';
  import RankInsignia from './RankInsignia.svelte';
  import Ribbon from './Ribbon.svelte';
  import type { Fact } from './bundle';
  import type { Question } from './quiz';
  let { fact, q }: { fact: Fact; q?: Question | null } = $props();
  const pic = $derived(q?.pic);
</script>

{#if pic?.ribbon}<span class="askpic"><Ribbon name={pic.ribbon} width={220} label="Ribbon to name" /></span>
{:else if pic?.rank}<span class="askpic"><RankInsignia rank={pic.rank} service={pic.service} size={128} label="Insignia to name" /></span>{/if}
{pic ? pic.ask : term(fact.q)}
