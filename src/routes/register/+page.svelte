<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { Passlock, PasslockError } from '@passlock/sveltekit'
  import type { SubmitFunction } from './$types'
  import { goto } from '$app/navigation'
  import Spinner from '$lib/Spinner.svelte'
  import { onMount } from 'svelte'

  import { 
    PUBLIC_PASSLOCK_TENANCY_ID, 
    PUBLIC_PASSLOCK_CLIENT_ID 
  } from '$env/static/public'

  const passlock = new Passlock({ 
    tenancyId: PUBLIC_PASSLOCK_TENANCY_ID, 
    clientId: PUBLIC_PASSLOCK_CLIENT_ID, 
    endpoint: 'https://okbq1o3xde.execute-api.eu-west-2.amazonaws.com' 
  })

  let requestPending = false

  const onSubmit: SubmitFunction = async ({ formData, cancel }) => {
    // show the spinner when the request is made
    requestPending = true
    const email = formData.get('email') as string
    const givenName = formData.get('givenName') as string
    const familyName = formData.get('familyName') as string

    const result = await passlock.registerPasskey({ 
      email, givenName, familyName
    })
    
    if (PasslockError.isError(result)) {
      // if we can't register a passkey, abort
      requestPending = false
      cancel()
      alert(result.message)
    } else {
      formData.set('token', result.token)
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
  First name: <input type="text" name="givenName" /> <br />
  Last name: <input type="text" name="familyName" /> <br />
  <input type="hidden" name="token" />
  <button type="submit">Register</button>

  {#if requestPending}
    <Spinner />
  {/if}
</form>