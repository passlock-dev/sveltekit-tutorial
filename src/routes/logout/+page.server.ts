// src/routes/logout/+page.server.ts
import type { Actions } from './$types'
import { lucia } from '$lib/server/auth'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ locals, cookies }) => {
    if (locals.session) {
      await lucia.invalidateSession(locals.session.id)
      cookies.delete(lucia.sessionCookieName, { path: '/' })
      redirect(302, '/login')
    }
  }
}