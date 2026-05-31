/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import { guestThrottle } from '#start/limiter'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())

/*
|--------------------------------------------------------------------------
| API Routes (migrated from v6 boilerplate)
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router
      .group(() => {
        router.post('register', [controllers.auth.Auth, 'register'])
        router.post('login', [controllers.auth.Auth, 'login'])

        // Anonymous guest session — rate-limited, public.
        router.post('guest', [controllers.auth.Auth, 'guest']).use(guestThrottle)
        // Promote the current guest (token required) to a full account.
        router
          .post('upgrade', [controllers.auth.Auth, 'upgrade'])
          .use(middleware.auth({ guards: ['api'] }))

        router.get('google/redirect', [controllers.auth.AuthGoogle, 'redirect'])
        router.get('google/signin/callback', [controllers.auth.AuthGoogle, 'handleCallback'])

        router.get('facebook/redirect', [controllers.auth.AuthFacebook, 'redirect'])
        router.get('facebook/signin/callback', [controllers.auth.AuthFacebook, 'handleCallback'])
      })
      .prefix('auth')

    router
      .get('me', async ({ auth, response }) => {
        try {
          const user = auth.getUserOrFail()
          return response.ok(user)
        } catch (error) {
          return response.unauthorized({
            message: 'You are not authorized to access this resource',
          })
        }
      })
      .use(middleware.auth({ guards: ['api'] }))

    router
      .group(() => {
        router.post('activate', [controllers.activation.Activations, 'activate'])
        router.post('forgot-password', [controllers.passwordReset.PasswordResets, 'forgot'])
        router.post('reset-password', [controllers.passwordReset.PasswordResets, 'reset'])
      })
      .prefix('user')
  })
  .prefix('api/v1')

/*
|--------------------------------------------------------------------------
| Tacticx domain routes
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    // Authenticated (api token) routes
    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show']).use(middleware.registered())
        router.put('profile', [controllers.Profile, 'update']).use(middleware.registered())

        router.get('pokemon', [controllers.Pokemon, 'index'])
        router.get('pokemon/:id', [controllers.Pokemon, 'show'])

        router.get('items', [controllers.Item, 'index'])

        router.get('teams', [controllers.Team, 'index'])
        router.post('teams', [controllers.Team, 'store'])
        router.get('teams/:id', [controllers.Team, 'show'])
        router.put('teams/:id', [controllers.Team, 'update'])
        router.delete('teams/:id', [controllers.Team, 'destroy'])
        router
          .post('teams/:id/publish', [controllers.Team, 'publish'])
          .use(middleware.premium())

        router.get('community', [controllers.Community, 'index'])
        router.get('community/:id', [controllers.Community, 'show'])
        router
          .post('community/:id/like', [controllers.Community, 'like'])
          .use(middleware.registered())
        router.get('community/:id/comments', [controllers.Comment, 'index'])
        router
          .post('community/:id/comments', [controllers.Comment, 'store'])
          .use(middleware.registered())
          .use(middleware.premium())

        router
          .get('subscription/status', [controllers.Subscription, 'status'])
          .use(middleware.registered())
      })
      .use(middleware.auth({ guards: ['api'] }))

    // Webhook (no auth middleware — verified by shared secret in controller)
    router.post('webhooks/revenuecat', [controllers.Webhook, 'revenuecat'])

    // Admin (token in header, verified in controller)
    router.post('admin/sync-pokemon', [controllers.Admin, 'syncPokemon'])
  })
  .prefix('api/v1')
