// src/routes/register/+page.server.ts
import type { Actions } from './$types'
import { PasslockError, TokenVerifier } from '@passlock/sveltekit'
import { PUBLIC_PASSLOCK_ENDPOINT, PUBLIC_PASSLOCK_TENANCY_ID } from '$env/static/public'
import { PASSLOCK_API_KEY } from '$env/static/private'
import { PrismaClient } from '@prisma/client'
import { error, redirect } from '@sveltejs/kit'

const client = new PrismaClient()

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
      // FIXME JUST FOR DEVELOPMENT TESTING!!!
      await client.user.deleteMany()

      await client.user.create({ 
        data: {
          id: user.sub,
          email: user.email as string,
          givenName: user.givenName,
          familyName: user.familyName
        }
      })

      redirect(302, '/login')
    } else {
      console.error(user)
      error(500, user.message)
    }
  }
}