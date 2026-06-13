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