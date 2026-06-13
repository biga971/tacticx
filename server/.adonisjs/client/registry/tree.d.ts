/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  legal: {
    confidentialite: typeof routes['legal.confidentialite']
    privacy: typeof routes['legal.privacy']
    support: typeof routes['legal.support']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  auth: {
    register: typeof routes['auth.register']
    login: typeof routes['auth.login']
    guest: typeof routes['auth.guest']
    upgrade: typeof routes['auth.upgrade']
    apple: typeof routes['auth.apple']
    google: typeof routes['auth.google']
    updateMe: typeof routes['auth.update_me']
  }
  authGoogle: {
    redirect: typeof routes['auth_google.redirect']
    handleCallback: typeof routes['auth_google.handle_callback']
  }
  authFacebook: {
    redirect: typeof routes['auth_facebook.redirect']
    handleCallback: typeof routes['auth_facebook.handle_callback']
  }
  activations: {
    activate: typeof routes['activations.activate']
  }
  passwordResets: {
    forgot: typeof routes['password_resets.forgot']
    reset: typeof routes['password_resets.reset']
  }
  profile: {
    show: typeof routes['profile.show']
    update: typeof routes['profile.update']
  }
  pokemon: {
    index: typeof routes['pokemon.index']
    show: typeof routes['pokemon.show']
  }
  item: {
    index: typeof routes['item.index']
  }
  meta: {
    index: typeof routes['meta.index']
    show: typeof routes['meta.show']
  }
  roster: {
    index: typeof routes['roster.index']
  }
  team: {
    index: typeof routes['team.index']
    store: typeof routes['team.store']
    show: typeof routes['team.show']
    update: typeof routes['team.update']
    destroy: typeof routes['team.destroy']
    publish: typeof routes['team.publish']
  }
  community: {
    index: typeof routes['community.index']
    show: typeof routes['community.show']
    like: typeof routes['community.like']
  }
  comment: {
    index: typeof routes['comment.index']
    store: typeof routes['comment.store']
  }
  subscription: {
    status: typeof routes['subscription.status']
  }
  webhook: {
    revenuecat: typeof routes['webhook.revenuecat']
  }
  admin: {
    syncPokemon: typeof routes['admin.sync_pokemon']
  }
  sync: {
    pikalytics: typeof routes['sync.pikalytics']
    smogon: typeof routes['sync.smogon']
    roster: typeof routes['sync.roster']
    status: typeof routes['sync.status']
  }
}
