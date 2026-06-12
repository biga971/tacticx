/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})

/**
 * Guest-session minting limiter. Caps how often a single IP can request a
 * fresh anonymous account/token, throttling scripted abuse of the open
 * endpoint while leaving real app launches unaffected.
 */
export const guestThrottle = limiter.define('guest', (ctx) => {
  return limiter
    .allowRequests(5)
    .every('1 hour')
    .usingKey(`guest_${ctx.request.ip()}`)
    .blockFor('1 hour')
})

/**
 * Native SSO (Apple / Google) id-token exchange limiter. Legit login flow, so
 * far more permissive than guest minting: caps brute-force without locking real
 * users out after a couple of retries. Separate key from the guest bucket.
 */
export const ssoThrottle = limiter.define('sso', (ctx) => {
  return limiter
    .allowRequests(20)
    .every('1 minute')
    .usingKey(`sso_${ctx.request.ip()}`)
})