<script lang="ts">
  let { size = 28 }: { size?: number } = $props();
</script>

<!-- The mark: shirt edge above, fly edge below, lined up through a brass buckle. Same geometry as index.html and scripts/make-icons.mjs. -->
<svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
  <rect width="100" height="100" rx="22" fill="#a6192e" />
  <rect x="45" y="16" width="10" height="18" rx="2" fill="#fff" />
  <rect x="37.5" y="37.5" width="25" height="25" rx="3" fill="none" stroke="#c8a12b" stroke-width="7" />
  <rect x="45" y="66" width="10" height="18" rx="2" fill="#fff" />
  
</svg>
