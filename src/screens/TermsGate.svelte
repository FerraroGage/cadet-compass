<script lang="ts">
  import { save, today } from '../lib/store.svelte';
  import { TERMS } from '../legal/terms';
  import Doc from './Doc.svelte';
  const agree = () => save('terms', { version: TERMS[0].version, acceptedOn: today() });
</script>

<h1>Before you start</h1>
<div class="block">
  <div class="head"><span class="n">1</span><span class="t">Read this first</span></div>
  <div class="in">
    <ol>
      <li>Ready Seats is an unofficial study aid. It is not affiliated with or endorsed by the Department of Defense, any military service or any JROTC program.</li>
      <li>Your instructor, your unit's orders and the current official publications outrank anything in this app.</li>
      <li>You must be 13 or older. If you are under 18, you need a parent's or guardian's permission.</li>
      <li>The app collects nothing. Your profile and progress stay on this device. See the <a href="#/settings/privacy">Privacy Policy</a>.</li>
    </ol>
  </div>
</div>

<Doc title="Terms of Service" doc={TERMS[0]} />

<div class="row">
  <button class="btn primary" onclick={agree}>I agree to the Terms</button>
</div>
<p class="help" style="margin-top: 8px">If you do not agree, close the app.</p>
