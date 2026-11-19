<script lang="ts">
  // Official U.S. government photos of each uniform. Credits mirror public/img/usmc/uniforms/credits.json.
  import { term } from './terms';
  const dir = import.meta.env.BASE_URL + 'img/usmc/uniforms/';
  // [file, official uniform name, one-line description, alt text, source label, photographer]
  const PHOTOS: [string, string, string, string, string, string][] = [
    ['blue-dress.jpg', 'Blue Dress "Bravo"', 'Dark blue coat with white belt and brass buttons, sky blue trousers with a red stripe, white cover.', 'A Marine in the dark blue dress coat with white belt, standing at attention', 'DVIDS, Lance Cpl. David Getz', 'dvidshub.net/image/9809111'],
    ['blue-dress-delta.jpg', 'Blue Dress "Delta"', 'Blue dress trousers with the khaki short-sleeve shirt and white cover, no coat.', 'Marines in blue dress trousers and khaki short-sleeve shirts being inspected', 'DVIDS, MC Seaman Michael Hendricks, U.S. Navy', 'dvidshub.net/image/542196'],
    ['service-alpha.jpg', 'Service "Alpha"', 'Green service coat with khaki shirt and tie, worn with green trousers.', 'A Marine in the green service coat at attention during an inspection', 'DVIDS, Lance Cpl. Van Hoang', 'dvidshub.net/image/9552360'],
    ['service-charlie.jpg', 'Service "Charlie"', 'Short-sleeve khaki shirt with green trousers, no tie.', 'Marines in short-sleeve khaki shirts and green trousers during an inspection', 'DVIDS, Gunnery Sgt. Kai W. Huber', 'dvidshub.net/image/9609034'],
    ['utility.jpg', 'Utility (camouflage, cammies)', 'The camouflage utility coat and trousers with tan boots and the utility cover.', 'A Marine in the camouflage utility uniform standing outdoors', 'DVIDS, Staff Sgt. Ramon Garcia', 'dvidshub.net/image/9110696'],
    ['pt-gear.jpg', 'PT Gear', 'Green PT shirt and shorts with running shoes.', 'Marines in green PT shirts and shorts at a physical training session', 'DVIDS, Sgt. Lucas Hopkins', 'dvidshub.net/image/2842696'],
    ['boots-and-utes.jpg', 'Boots and Utes', 'Utility trousers and boots worn with a PT shirt for a run or field event.', 'Marines in utility trousers and boots with PT shirts at a field event', 'DVIDS, U.S. Marine Corps', 'dvidshub.net/image/1773697'],
  ];
</script>

<h2>What each uniform looks like</h2>
<ul class="uphotos">
  {#each PHOTOS as [file, name, note, alt, credit, url]}
    <li>
      <img src={dir + file} {alt} loading="lazy" />
      <div>
        <strong>{term(name)}</strong>
        <span>{note}</span>
        <small>Photo: <a href="https://www.{url}" target="_blank" rel="noopener noreferrer">{credit}</a>. U.S. government work, public domain.</small>
      </div>
    </li>
  {/each}
</ul>

<style>
  .uphotos { list-style: none; margin: 8px 0 16px; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
  li { border: 1px solid var(--line, #ccc); border-radius: 12px; overflow: hidden; background: var(--card, transparent); }
  img { display: block; width: 100%; aspect-ratio: 3 / 2; object-fit: cover; object-position: top; }
  div { padding: 10px 12px; display: grid; gap: 4px; }
  span { font-size: 0.9rem; }
  small { opacity: 0.7; }
</style>
