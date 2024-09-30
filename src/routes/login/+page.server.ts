// src/routes/login/+page.server.ts
import type { Actions } from './$types'
import { PasslockError, TokenVerifier } from '@passlock/sveltekit'
import { PUBLIC_PASSLOCK_TENANCY_ID, PUBLIC_PASSLOCK_ENDPOINT } from '$env/static/public'
import { PASSLOCK_API_KEY } from '$env/static/private'

const tokenVerifier = new TokenVerifier({
  tenancyId: PUBLIC_PASSLOCK_TENANCY_ID, 
  apiKey: PASSLOCK_API_KEY,
  endpoint: PUBLIC_PASSLOCK_ENDPOINT
})

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    const token = formData.get('token') as string
    const user = await tokenVerifier.exchangeToken(token)
    
    if (!PasslockError.isError(user)) {
      console.log(user)
    } else {
      console.error(user.message)
    }
  }
}