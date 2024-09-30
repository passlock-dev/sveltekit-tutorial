// src/routes/login/+page.server.ts
import type { Actions } from './$types'
import { PasslockError, TokenVerifier } from '@passlock/sveltekit'
import { PUBLIC_PASSLOCK_ENDPOINT, PUBLIC_PASSLOCK_TENANCY_ID } from '$env/static/public'
import { PASSLOCK_API_KEY } from '$env/static/private'
import { lucia } from '$lib/server/auth'
import { error, redirect } from '@sveltejs/kit'

const tokenVerifier = new TokenVerifier({
  tenancyId: PUBLIC_PASSLOCK_TENANCY_ID, 
  apiKey: PASSLOCK_API_KEY,
  endpoint: PUBLIC_PASSLOCK_ENDPOINT
})

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData()
    const token = formData.get('token') as string
    const user = await tokenVerifier.exchangeToken(token)
    
    if (!PasslockError.isError(user)) {
      await lucia.invalidateUserSessions(user.sub)
      const session = await lucia.createSession(user.sub, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      
      cookies.set(
        lucia.sessionCookieName, 
        sessionCookie.value, 
        { path: '/', ...sessionCookie.attributes }
      )

      redirect(302, '/')
    } else {
      console.error(user)
      error(500, user.message)
    }
  }
}