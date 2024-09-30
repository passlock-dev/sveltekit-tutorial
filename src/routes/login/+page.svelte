<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms'
  import { Passlock, PasslockError } from '@passlock/sveltekit'
  import type { SubmitFunction } from './$types'

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

  const onSubmit: SubmitFunction = async ({ cancel, formData }) => {
    const email = formData.get('email') as string

    const user = await passlock.authenticatePasskey({ email })

    if (!PasslockError.isError(user)) {
      formData.set('token', user.token)
    } else {
      cancel() // prevent form submission
      alert(user.message)
    }
  }
</script>

<form method="post" use:enhance={onSubmit}>
  Email: <input type="text" name="email" /> <br />
  <button type="submit">Login</button>
</form>