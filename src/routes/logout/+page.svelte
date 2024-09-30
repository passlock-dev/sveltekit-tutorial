<!-- src/routes/logout/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types'
    
  export let data: PageData
</script>

<form method="post">
  <button type="submit">Logout</button>
</form>