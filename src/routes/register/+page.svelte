<!-- src/routes/register/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from './$types'
  import { Passlock, PasslockError } from '@passlock/sveltekit'

  import { 
    PUBLIC_PASSLOCK_TENANCY_ID, 
    PUBLIC_PASSLOCK_CLIENT_ID,
    PUBLIC_PASSLOCK_ENDPOINT
  } from '$env/static/public'

  const passlock = new Passlock({ 
    tenancyId: PUBLIC_PASSLOCK_TENANCY_ID, 
    clientId: PUBLIC_PASSLOCK_CLIENT_ID,
    endpoint: PUBLIC_PASSLOCK_ENDPOINT
  })

  // during form submission, ask Passlock to register a
  // passkey on the user's device. This will return a 
  // secure token, representing the newly created passkey
  const registerPasskey: SubmitFunction = async ({ cancel, formData }) => {
    const email = formData.get('email') as string
    const givenName = formData.get('givenName') as string
    const familyName = formData.get('familyName') as string

    const user = await passlock.registerPasskey({ 
      email, givenName, familyName 
    })

    if (!PasslockError.isError(user)) {
      // attach the token to the request
      formData.set('token', user.token)
    } else {
      cancel() // prevent form submission
      alert(user.message)
    }
  }
</script>

<form method="post" use:enhance={registerPasskey}>
  Email: <input type="text" name="email" /> <br />
  First name: <input type="text" name="givenName" /> <br />
  Last name: <input type="text" name="familyName" /> <br />
  <button type="submit">Register</button>
</form>