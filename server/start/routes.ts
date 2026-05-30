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
const ProfileController = () => import('#controllers/profile_controller')
const PokemonController = () => import('#controllers/pokemon_controller')
const ItemController = () => import('#controllers/item_controller')
const TeamController = () => import('#controllers/team_controller')
const CommunityController = () => import('#controllers/community_controller')
const CommentController = () => import('#controllers/comment_controller')
const SubscriptionController = () => import('#controllers/subscription_controller')
const WebhookController = () => import('#controllers/webhook_controller')
const AdminController = () => import('#controllers/admin_controller')

router
  .group(() => {
    // Authenticated (api token) routes
    router
      .group(() => {
        router.get('profile', [ProfileController, 'show'])
        router.put('profile', [ProfileController, 'update'])

        router.get('pokemon', [PokemonController, 'index'])
        router.get('pokemon/:id', [PokemonController, 'show'])

        router.get('items', [ItemController, 'index'])

        router.get('teams', [TeamController, 'index'])
        router.post('teams', [TeamController, 'store'])
        router.get('teams/:id', [TeamController, 'show'])
        router.put('teams/:id', [TeamController, 'update'])
        router.delete('teams/:id', [TeamController, 'destroy'])
        router
          .post('teams/:id/publish', [TeamController, 'publish'])
          .use(middleware.premium())

        router.get('community', [CommunityController, 'index'])
        router.get('community/:id', [CommunityController, 'show'])
        router.post('community/:id/like', [CommunityController, 'like'])
        router.get('community/:id/comments', [CommentController, 'index'])
        router
          .post('community/:id/comments', [CommentController, 'store'])
          .use(middleware.premium())

        router.get('subscription/status', [SubscriptionController, 'status'])
      })
      .use(middleware.auth({ guards: ['api'] }))

    // Webhook (no auth middleware — verified by shared secret in controller)
    router.post('webhooks/revenuecat', [WebhookController, 'revenuecat'])

    // Admin (token in header, verified in controller)
    router.post('admin/sync-pokemon', [AdminController, 'syncPokemon'])
  })
  .prefix('api/v1')
