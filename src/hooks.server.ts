// src/hooks.server.ts
import { lucia } from "$lib/server/auth"
import { redirect, type Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(lucia.sessionCookieName)

  const { session, user } = sessionId ? 
    await lucia.validateSession(sessionId) : 
    { session: null, user: null }

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id)
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    })
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie()
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    })
  }

  event.locals.user = user
  event.locals.session = session

  if (event.route.id === '/status' && !event.locals.user) {
    redirect(302, '/login')
  }

  return resolve(event)
}