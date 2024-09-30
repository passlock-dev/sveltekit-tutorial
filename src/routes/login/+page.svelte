<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { Passlock, PasslockError } from '@passlock/sveltekit'
  import type { SubmitFunction } from './$types'
  import Spinner from '$lib/Spinner.svelte'
  import { onMount } from 'svelte'

  import { 
    PUBLIC_PASSLOCK_TENANCY_ID, 
    PUBLIC_PASSLOCK_CLIENT_ID,
    PUBLIC_PASSLOCK_ENDPOINT
  } from '$env/static/public'
    import { goto } from '$app/navigation';

  const passlock = new Passlock({ 
    tenancyId: PUBLIC_PASSLOCK_TENANCY_ID, 
    clientId: PUBLIC_PASSLOCK_CLIENT_ID,
    endpoint: PUBLIC_PASSLOCK_ENDPOINT
  })

  let requestPending = false

  const onSubmit: SubmitFunction = async ({ cancel, formData }) => {
    // show the spinner when the request is made
    requestPending = true
    const email = formData.get('email') as string

    const user = await passlock.authenticatePasskey({ email })

    if (!PasslockError.isError(user)) {
      // if we can't login using a passkey, abort
      requestPending = false      
      formData.set('token', user.token)
    } else {
      cancel() // prevent form submission
      alert(user.message)
    }

    return async ({ result }) => {
      // form action completed so hide the spinner
      requestPending = false
      if (result.type === 'redirect') {
        goto(result.location)
      } else {
        await applyAction(result)
      }
    }    
  }

  onMount(async () => {
    await passlock.preConnect()
  })
</script>

<form method="post" use:enhance={onSubmit}>
  Email: <input type="text" name="email" /> <br />
  <button type="submit">Login</button>

  {#if requestPending}
    <Spinner />
  {/if}
</form>