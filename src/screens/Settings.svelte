<script lang="ts">
  import { app, save, deleteEverything, fmtDate } from '../lib/store.svelte';
  import { TERMS } from '../legal/terms';
  import { PRIVACY } from '../legal/privacy';
  import Doc from './Doc.svelte';
  import Onboarding from './Onboarding.svelte';

  let { page }: { page: string } = $props();
  const b = app.bundle!;
  const seen = app.seenVersion;
  $effect(() => { if (page === 'changes' && app.seenVersion < b.version) save('seenVersion', b.version); });

  function wipe() {
    if (confirm('Delete your profile, progress and test results from this device? This cannot be undone.')) deleteEverything();
  }
  const PAGES = [
    ['profile', 'Cadet profile', 'Program, rank, goals, study time'],
    ['changes', 'What changed', `Content version ${b.version}, ${fmtDate(b.date)}`],
    ['about', 'About', 'What this app is and is not'],
    ['legal', 'Legal and credits', 'Disclaimer, fonts, software, sources'],
    ['terms', 'Terms of Service', TERMS[0].date],
    ['privacy', 'Privacy Policy', PRIVACY[0].date],
  ];
  const CREDITS = [
    ['Barlow Condensed (typeface)', 'Jeremy Tribby', 'SIL Open Font License 1.1'],
    ['Source Serif 4 (typeface)', 'Frank Griesshammer, Adobe', 'SIL Open Font License 1.1'],
    ['Fontsource (font packaging)', 'Fontsource contributors', 'MIT'],
    ['Svelte', 'Svelte contributors', 'MIT'],
    ['Vite and vite-plugin-pwa', 'Vite and Vite PWA contributors', 'MIT'],
    ['Workbox', 'Google', 'MIT'],
    ['Dexie.js', 'David Fahlander', 'Apache 2.0'],
    ['App icon', 'Made for this app', 'Original work'],
  ];
  const sources = [...new Map(b.facts.map((f) => [f.source.url, f])).values()];
</script>

{#if page === 'profile'}
  <Onboarding edit />
{:else if page === 'changes'}
  <h1>What changed</h1>
  <p class="label">You have content version {b.version}, dated {fmtDate(b.date)}</p>
  {#each b.changelog as c}
    <h2>Version {c.version}, {fmtDate(c.date)} {#if c.version > seen}<span class="tag">New</span>{/if}</h2>
    <ul>{#each c.changes as line}<li>{line}</li>{/each}</ul>
  {/each}
{:else if page === 'about'}
  <h1>About</h1>
  <p>Ready Seats is a study aid for Junior ROTC cadets. It covers ranks, ribbons, chain of command, uniform, drill, general knowledge and program rules, and it tests what you know so you can train what you do not.</p>
  <p class="notice"><strong>Unofficial.</strong> This app is not affiliated with or endorsed by the Department of Defense (Department of War), any military service or any JROTC program. See <a href="#/settings/legal">Legal and credits</a>.</p>
  <h2>How the content is kept honest</h2>
  <ol>
    <li>Every fact names the publication it came from, the edition, and the date it was last checked.</li>
    <li>A fact that could not be checked is marked "Not verified" and is never used in a quiz.</li>
    <li>Names of office holders are rechecked on a schedule. One that is more than 30 days past its check is flagged and left out of quizzes.</li>
    <li>Your instructor and your unit's orders always outrank this app.</li>
  </ol>
  <h2>Contact</h2>
  <p>Gage A. Pierce, Kellogg, Idaho. Report an error or ask a question: <a href="mailto:piercegage19@gmail.com">piercegage19@gmail.com</a></p>
  <p class="label">App version {__APP_VERSION__} / content version {b.version}</p>
{:else if page === 'legal'}
  <h1>Legal and credits</h1>
  <p>Ready Seats is an unofficial study aid. It is not affiliated with, sponsored by or endorsed by the Department of Defense (Department of War), any military service or any JROTC program.</p>
  <p>The developer does not own or claim ownership of any service name, mark or insignia. All such names belong to their owners and appear here only to identify the subject. No service seal, emblem or logo is used in this app.</p>
  <p><a href="#/settings/terms">Terms of Service</a> / <a href="#/settings/privacy">Privacy Policy</a></p>
  <h2>Fonts, software and images</h2>
  <table>
    <thead><tr><th scope="col">Resource</th><th scope="col">Author</th><th scope="col">License</th></tr></thead>
    <tbody>{#each CREDITS as [what, who, lic]}<tr><td>{what}</td><td>{who}</td><td>{lic}</td></tr>{/each}</tbody>
  </table>
  <p class="help">No photographs or third-party images are used.</p>
  <h2>Publications the content is based on</h2>
  <table>
    <thead><tr><th scope="col">Publication</th><th scope="col">Publisher</th><th scope="col">Edition</th></tr></thead>
    <tbody>
      {#each sources as f}
        <tr><td><a href={f.source.url} target="_blank" rel="noopener noreferrer">{f.source.title}</a></td><td>{f.source.publisher}</td><td>{f.edition}</td></tr>
      {/each}
    </tbody>
  </table>
  <p class="help">Works of the United States Government are in the public domain. The facts are restated in our own words, except lists that must be learned word for word.</p>
{:else if page === 'terms'}
  <h1>Terms of Service</h1>
  {#if app.terms}<p class="label">You agreed to the {app.terms.version} version on {fmtDate(app.terms.acceptedOn)}</p>{/if}
  {#each TERMS as doc, i}<Doc title={i ? 'Earlier version' : 'Current version'} {doc} />{/each}
{:else if page === 'privacy'}
  <h1>Privacy Policy</h1>
  {#each PRIVACY as doc, i}<Doc title={i ? 'Earlier version' : 'Current version'} {doc} />{/each}
{:else}
  <h1>Settings</h1>
  <table>
    <tbody>
      {#each PAGES as [id, name, note]}
        <tr><td><a class="btn" style="width: 100%; justify-content: flex-start" href="#/settings/{id}">{name}</a><p class="cite">{note}</p></td></tr>
      {/each}
    </tbody>
  </table>
  <h2>Delete my data</h2>
  <p>Removes your profile, progress, test results and the stored content from this device. Nothing is kept anywhere else, so this removes everything.</p>
  <button class="btn danger" onclick={wipe}>Delete my data</button>
{/if}

{#if page && page !== 'profile'}
  <div class="row"><a class="btn" href={app.profile ? '#/settings' : '#/'}>Back</a></div>
{/if}
