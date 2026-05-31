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
        router.post('register', [controllers.Auth, 'register'])
        router.post('login', [controllers.Auth, 'login'])

        router.get('google/redirect', [controllers.AuthGoogle, 'redirect'])
        router.get('google/signin/callback', [controllers.AuthGoogle, 'handleCallback'])

        router.get('facebook/redirect', [controllers.AuthFacebook, 'redirect'])
        router.get('facebook/signin/callback', [controllers.AuthFacebook, 'handleCallback'])
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
        router.post('activate', [controllers.Activation, 'activate'])
        router.post('forgot-password', [controllers.PasswordReset, 'forgot'])
        router.post('reset-password', [controllers.PasswordReset, 'reset'])
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
        router.get('profile', [controllers.Profile, 'show'])
        router.put('profile', [controllers.Profile, 'update'])

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
        router.post('community/:id/like', [controllers.Community, 'like'])
        router.get('community/:id/comments', [controllers.Comment, 'index'])
        router
          .post('community/:id/comments', [controllers.Comment, 'store'])
          .use(middleware.premium())

        router.get('subscription/status', [controllers.Subscription, 'status'])
      })
      .use(middleware.auth({ guards: ['api'] }))

    // Webhook (no auth middleware — verified by shared secret in controller)
    router.post('webhooks/revenuecat', [controllers.Webhook, 'revenuecat'])

    // Admin (token in header, verified in controller)
    router.post('admin/sync-pokemon', [controllers.Admin, 'syncPokemon'])
  })
  .prefix('api/v1')
