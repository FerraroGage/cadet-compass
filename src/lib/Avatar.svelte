<script lang="ts" module>
  // Eight original avatars: a plain shape on a brand color. No photos, no insignia.
  // [name, background, glyph color, path on a 24 unit grid]
  export const AVATARS: [string, string, string, string][] = [
    ['Needle', '#16324f', '#e8b923', 'M12 3l3.2 9L12 21l-3.2-9z'],
    ['Star', '#c0392b', '#f2ebd3', 'M12 3.5l2.5 5.4 5.9.7-4.4 4 1.2 5.9L12 16.6l-5.2 2.9L8 13.6l-4.4-4 5.9-.7z'],
    ['Summit', '#1f7a4d', '#f2ebd3', 'M2.5 19l6.5-11 3 5 2-3 7.5 9z'],
    ['Pennant', '#e8b923', '#0f2339', 'M6 3h1.8v1H19l-3.2 4L19 12H7.8v9H6z'],
    ['Flame', '#0f2339', '#e8b923', 'M12 2.5c3.5 4 5.5 6.3 5.5 9.7a5.5 5.5 0 0 1-11 0c0-2 1-3.4 2.2-4.6.1 2 .9 3.2 2 3.4-.2-3 .1-5.7 1.3-8.5z'],
    ['Bolt', '#1d5fa8', '#ffffff', 'M13.5 2L5 13.5h5.5L9.5 22 19 10h-6z'],
    ['Book', '#3a3f6b', '#f2ebd3', 'M3 5h7.5c.6 0 1.1.3 1.5.8.4-.5.9-.8 1.5-.8H21v14h-7.5c-.6 0-1.1.3-1.5.8-.4-.5-.9-.8-1.5-.8H3z'],
    ['Bearing', '#f2ebd3', '#16324f', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 3.2a5.8 5.8 0 1 1 0 11.6 5.8 5.8 0 0 1 0-11.6zm0 3.3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'],
  ];
</script>

<script lang="ts">
  let { id = 0, size = 64 }: { id?: number; size?: number } = $props();
  const a = $derived(AVATARS[id] ?? AVATARS[0]);
</script>

<svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style="flex: none">
  <circle cx="24" cy="24" r="24" fill={a[1]} />
  <path d={a[3]} fill={a[2]} fill-rule="evenodd" transform="translate(9 9) scale(1.25)" />
</svg>
