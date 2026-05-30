export const controllers = {
  NewAccount: () => import('#controllers/new_account_controller'),
  Session: () => import('#controllers/session_controller'),
  Activation: () => import('#controllers/activation/activations_controller'),
  PasswordReset: () => import('#controllers/password_reset/password_resets_controller'),
  Auth: () => import('#controllers/auth_controller'),
  AuthGoogle: () => import('#controllers/auth_google_controller'),
  AuthFacebook: () => import('#controllers/auth_facebook_controller'),
}
