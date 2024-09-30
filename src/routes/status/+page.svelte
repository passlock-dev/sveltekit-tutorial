<!-- src/routes/status/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types'
  
  export let data: PageData
</script>

userId: {data.user?.id}