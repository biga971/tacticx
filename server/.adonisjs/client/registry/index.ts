/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'legal.confidentialite': {
    methods: ["GET","HEAD"],
    pattern: '/confidentialite',
    tokens: [{"old":"/confidentialite","type":0,"val":"confidentialite","end":""}],
    types: placeholder as Registry['legal.confidentialite']['types'],
  },
  'legal.privacy': {
    methods: ["GET","HEAD"],
    pattern: '/privacy',
    tokens: [{"old":"/privacy","type":0,"val":"privacy","end":""}],
    types: placeholder as Registry['legal.privacy']['types'],
  },
  'legal.support': {
    methods: ["GET","HEAD"],
    pattern: '/support',
    tokens: [{"old":"/support","type":0,"val":"support","end":""}],
    types: placeholder as Registry['legal.support']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'auth.register': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register',
    tokens: [{"old":"/api/v1/auth/register","type":0,"val":"api","end":""},{"old":"/api/v1/auth/register","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/register","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.guest': {
    methods: ["POST"],
    pattern: '/api/v1/auth/guest',
    tokens: [{"old":"/api/v1/auth/guest","type":0,"val":"api","end":""},{"old":"/api/v1/auth/guest","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/guest","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/guest","type":0,"val":"guest","end":""}],
    types: placeholder as Registry['auth.guest']['types'],
  },
  'auth.upgrade': {
    methods: ["POST"],
    pattern: '/api/v1/auth/upgrade',
    tokens: [{"old":"/api/v1/auth/upgrade","type":0,"val":"api","end":""},{"old":"/api/v1/auth/upgrade","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/upgrade","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/upgrade","type":0,"val":"upgrade","end":""}],
    types: placeholder as Registry['auth.upgrade']['types'],
  },
  'auth.apple': {
    methods: ["POST"],
    pattern: '/api/v1/auth/apple',
    tokens: [{"old":"/api/v1/auth/apple","type":0,"val":"api","end":""},{"old":"/api/v1/auth/apple","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/apple","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/apple","type":0,"val":"apple","end":""}],
    types: placeholder as Registry['auth.apple']['types'],
  },
  'auth.google': {
    methods: ["POST"],
    pattern: '/api/v1/auth/google',
    tokens: [{"old":"/api/v1/auth/google","type":0,"val":"api","end":""},{"old":"/api/v1/auth/google","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/google","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/google","type":0,"val":"google","end":""}],
    types: placeholder as Registry['auth.google']['types'],
  },
  'auth_google.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/google/redirect',
    tokens: [{"old":"/api/v1/auth/google/redirect","type":0,"val":"api","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"google","end":""},{"old":"/api/v1/auth/google/redirect","type":0,"val":"redirect","end":""}],
    types: placeholder as Registry['auth_google.redirect']['types'],
  },
  'auth_google.handle_callback': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/google/signin/callback',
    tokens: [{"old":"/api/v1/auth/google/signin/callback","type":0,"val":"api","end":""},{"old":"/api/v1/auth/google/signin/callback","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/google/signin/callback","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/google/signin/callback","type":0,"val":"google","end":""},{"old":"/api/v1/auth/google/signin/callback","type":0,"val":"signin","end":""},{"old":"/api/v1/auth/google/signin/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth_google.handle_callback']['types'],
  },
  'auth_facebook.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/facebook/redirect',
    tokens: [{"old":"/api/v1/auth/facebook/redirect","type":0,"val":"api","end":""},{"old":"/api/v1/auth/facebook/redirect","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/facebook/redirect","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/facebook/redirect","type":0,"val":"facebook","end":""},{"old":"/api/v1/auth/facebook/redirect","type":0,"val":"redirect","end":""}],
    types: placeholder as Registry['auth_facebook.redirect']['types'],
  },
  'auth_facebook.handle_callback': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/facebook/signin/callback',
    tokens: [{"old":"/api/v1/auth/facebook/signin/callback","type":0,"val":"api","end":""},{"old":"/api/v1/auth/facebook/signin/callback","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/facebook/signin/callback","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/facebook/signin/callback","type":0,"val":"facebook","end":""},{"old":"/api/v1/auth/facebook/signin/callback","type":0,"val":"signin","end":""},{"old":"/api/v1/auth/facebook/signin/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth_facebook.handle_callback']['types'],
  },
  'auth.update_me': {
    methods: ["PATCH"],
    pattern: '/api/v1/me',
    tokens: [{"old":"/api/v1/me","type":0,"val":"api","end":""},{"old":"/api/v1/me","type":0,"val":"v1","end":""},{"old":"/api/v1/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth.update_me']['types'],
  },
  'activations.activate': {
    methods: ["POST"],
    pattern: '/api/v1/user/activate',
    tokens: [{"old":"/api/v1/user/activate","type":0,"val":"api","end":""},{"old":"/api/v1/user/activate","type":0,"val":"v1","end":""},{"old":"/api/v1/user/activate","type":0,"val":"user","end":""},{"old":"/api/v1/user/activate","type":0,"val":"activate","end":""}],
    types: placeholder as Registry['activations.activate']['types'],
  },
  'password_resets.forgot': {
    methods: ["POST"],
    pattern: '/api/v1/user/forgot-password',
    tokens: [{"old":"/api/v1/user/forgot-password","type":0,"val":"api","end":""},{"old":"/api/v1/user/forgot-password","type":0,"val":"v1","end":""},{"old":"/api/v1/user/forgot-password","type":0,"val":"user","end":""},{"old":"/api/v1/user/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['password_resets.forgot']['types'],
  },
  'password_resets.reset': {
    methods: ["POST"],
    pattern: '/api/v1/user/reset-password',
    tokens: [{"old":"/api/v1/user/reset-password","type":0,"val":"api","end":""},{"old":"/api/v1/user/reset-password","type":0,"val":"v1","end":""},{"old":"/api/v1/user/reset-password","type":0,"val":"user","end":""},{"old":"/api/v1/user/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['password_resets.reset']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/profile',
    tokens: [{"old":"/api/v1/profile","type":0,"val":"api","end":""},{"old":"/api/v1/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.show']['types'],
  },
  'profile.update': {
    methods: ["PUT"],
    pattern: '/api/v1/profile',
    tokens: [{"old":"/api/v1/profile","type":0,"val":"api","end":""},{"old":"/api/v1/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.update']['types'],
  },
  'pokemon.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/pokemon',
    tokens: [{"old":"/api/v1/pokemon","type":0,"val":"api","end":""},{"old":"/api/v1/pokemon","type":0,"val":"v1","end":""},{"old":"/api/v1/pokemon","type":0,"val":"pokemon","end":""}],
    types: placeholder as Registry['pokemon.index']['types'],
  },
  'pokemon.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/pokemon/:id',
    tokens: [{"old":"/api/v1/pokemon/:id","type":0,"val":"api","end":""},{"old":"/api/v1/pokemon/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/pokemon/:id","type":0,"val":"pokemon","end":""},{"old":"/api/v1/pokemon/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['pokemon.show']['types'],
  },
  'item.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/items',
    tokens: [{"old":"/api/v1/items","type":0,"val":"api","end":""},{"old":"/api/v1/items","type":0,"val":"v1","end":""},{"old":"/api/v1/items","type":0,"val":"items","end":""}],
    types: placeholder as Registry['item.index']['types'],
  },
  'meta.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/meta',
    tokens: [{"old":"/api/v1/meta","type":0,"val":"api","end":""},{"old":"/api/v1/meta","type":0,"val":"v1","end":""},{"old":"/api/v1/meta","type":0,"val":"meta","end":""}],
    types: placeholder as Registry['meta.index']['types'],
  },
  'meta.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/meta/:name',
    tokens: [{"old":"/api/v1/meta/:name","type":0,"val":"api","end":""},{"old":"/api/v1/meta/:name","type":0,"val":"v1","end":""},{"old":"/api/v1/meta/:name","type":0,"val":"meta","end":""},{"old":"/api/v1/meta/:name","type":1,"val":"name","end":""}],
    types: placeholder as Registry['meta.show']['types'],
  },
  'roster.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/roster',
    tokens: [{"old":"/api/v1/roster","type":0,"val":"api","end":""},{"old":"/api/v1/roster","type":0,"val":"v1","end":""},{"old":"/api/v1/roster","type":0,"val":"roster","end":""}],
    types: placeholder as Registry['roster.index']['types'],
  },
  'team.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/teams',
    tokens: [{"old":"/api/v1/teams","type":0,"val":"api","end":""},{"old":"/api/v1/teams","type":0,"val":"v1","end":""},{"old":"/api/v1/teams","type":0,"val":"teams","end":""}],
    types: placeholder as Registry['team.index']['types'],
  },
  'team.store': {
    methods: ["POST"],
    pattern: '/api/v1/teams',
    tokens: [{"old":"/api/v1/teams","type":0,"val":"api","end":""},{"old":"/api/v1/teams","type":0,"val":"v1","end":""},{"old":"/api/v1/teams","type":0,"val":"teams","end":""}],
    types: placeholder as Registry['team.store']['types'],
  },
  'team.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/teams/:id',
    tokens: [{"old":"/api/v1/teams/:id","type":0,"val":"api","end":""},{"old":"/api/v1/teams/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/teams/:id","type":0,"val":"teams","end":""},{"old":"/api/v1/teams/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['team.show']['types'],
  },
  'team.update': {
    methods: ["PUT"],
    pattern: '/api/v1/teams/:id',
    tokens: [{"old":"/api/v1/teams/:id","type":0,"val":"api","end":""},{"old":"/api/v1/teams/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/teams/:id","type":0,"val":"teams","end":""},{"old":"/api/v1/teams/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['team.update']['types'],
  },
  'team.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/teams/:id',
    tokens: [{"old":"/api/v1/teams/:id","type":0,"val":"api","end":""},{"old":"/api/v1/teams/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/teams/:id","type":0,"val":"teams","end":""},{"old":"/api/v1/teams/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['team.destroy']['types'],
  },
  'team.publish': {
    methods: ["POST"],
    pattern: '/api/v1/teams/:id/publish',
    tokens: [{"old":"/api/v1/teams/:id/publish","type":0,"val":"api","end":""},{"old":"/api/v1/teams/:id/publish","type":0,"val":"v1","end":""},{"old":"/api/v1/teams/:id/publish","type":0,"val":"teams","end":""},{"old":"/api/v1/teams/:id/publish","type":1,"val":"id","end":""},{"old":"/api/v1/teams/:id/publish","type":0,"val":"publish","end":""}],
    types: placeholder as Registry['team.publish']['types'],
  },
  'community.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/community',
    tokens: [{"old":"/api/v1/community","type":0,"val":"api","end":""},{"old":"/api/v1/community","type":0,"val":"v1","end":""},{"old":"/api/v1/community","type":0,"val":"community","end":""}],
    types: placeholder as Registry['community.index']['types'],
  },
  'community.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/community/:id',
    tokens: [{"old":"/api/v1/community/:id","type":0,"val":"api","end":""},{"old":"/api/v1/community/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/community/:id","type":0,"val":"community","end":""},{"old":"/api/v1/community/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['community.show']['types'],
  },
  'community.like': {
    methods: ["POST"],
    pattern: '/api/v1/community/:id/like',
    tokens: [{"old":"/api/v1/community/:id/like","type":0,"val":"api","end":""},{"old":"/api/v1/community/:id/like","type":0,"val":"v1","end":""},{"old":"/api/v1/community/:id/like","type":0,"val":"community","end":""},{"old":"/api/v1/community/:id/like","type":1,"val":"id","end":""},{"old":"/api/v1/community/:id/like","type":0,"val":"like","end":""}],
    types: placeholder as Registry['community.like']['types'],
  },
  'comment.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/community/:id/comments',
    tokens: [{"old":"/api/v1/community/:id/comments","type":0,"val":"api","end":""},{"old":"/api/v1/community/:id/comments","type":0,"val":"v1","end":""},{"old":"/api/v1/community/:id/comments","type":0,"val":"community","end":""},{"old":"/api/v1/community/:id/comments","type":1,"val":"id","end":""},{"old":"/api/v1/community/:id/comments","type":0,"val":"comments","end":""}],
    types: placeholder as Registry['comment.index']['types'],
  },
  'comment.store': {
    methods: ["POST"],
    pattern: '/api/v1/community/:id/comments',
    tokens: [{"old":"/api/v1/community/:id/comments","type":0,"val":"api","end":""},{"old":"/api/v1/community/:id/comments","type":0,"val":"v1","end":""},{"old":"/api/v1/community/:id/comments","type":0,"val":"community","end":""},{"old":"/api/v1/community/:id/comments","type":1,"val":"id","end":""},{"old":"/api/v1/community/:id/comments","type":0,"val":"comments","end":""}],
    types: placeholder as Registry['comment.store']['types'],
  },
  'subscription.status': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/subscription/status',
    tokens: [{"old":"/api/v1/subscription/status","type":0,"val":"api","end":""},{"old":"/api/v1/subscription/status","type":0,"val":"v1","end":""},{"old":"/api/v1/subscription/status","type":0,"val":"subscription","end":""},{"old":"/api/v1/subscription/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['subscription.status']['types'],
  },
  'webhook.revenuecat': {
    methods: ["POST"],
    pattern: '/api/v1/webhooks/revenuecat',
    tokens: [{"old":"/api/v1/webhooks/revenuecat","type":0,"val":"api","end":""},{"old":"/api/v1/webhooks/revenuecat","type":0,"val":"v1","end":""},{"old":"/api/v1/webhooks/revenuecat","type":0,"val":"webhooks","end":""},{"old":"/api/v1/webhooks/revenuecat","type":0,"val":"revenuecat","end":""}],
    types: placeholder as Registry['webhook.revenuecat']['types'],
  },
  'admin.sync_pokemon': {
    methods: ["POST"],
    pattern: '/api/v1/admin/sync-pokemon',
    tokens: [{"old":"/api/v1/admin/sync-pokemon","type":0,"val":"api","end":""},{"old":"/api/v1/admin/sync-pokemon","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/sync-pokemon","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/sync-pokemon","type":0,"val":"sync-pokemon","end":""}],
    types: placeholder as Registry['admin.sync_pokemon']['types'],
  },
  'sync.pikalytics': {
    methods: ["POST"],
    pattern: '/internal/sync/meta/pikalytics',
    tokens: [{"old":"/internal/sync/meta/pikalytics","type":0,"val":"internal","end":""},{"old":"/internal/sync/meta/pikalytics","type":0,"val":"sync","end":""},{"old":"/internal/sync/meta/pikalytics","type":0,"val":"meta","end":""},{"old":"/internal/sync/meta/pikalytics","type":0,"val":"pikalytics","end":""}],
    types: placeholder as Registry['sync.pikalytics']['types'],
  },
  'sync.smogon': {
    methods: ["POST"],
    pattern: '/internal/sync/meta/smogon',
    tokens: [{"old":"/internal/sync/meta/smogon","type":0,"val":"internal","end":""},{"old":"/internal/sync/meta/smogon","type":0,"val":"sync","end":""},{"old":"/internal/sync/meta/smogon","type":0,"val":"meta","end":""},{"old":"/internal/sync/meta/smogon","type":0,"val":"smogon","end":""}],
    types: placeholder as Registry['sync.smogon']['types'],
  },
  'sync.roster': {
    methods: ["POST"],
    pattern: '/internal/sync/roster',
    tokens: [{"old":"/internal/sync/roster","type":0,"val":"internal","end":""},{"old":"/internal/sync/roster","type":0,"val":"sync","end":""},{"old":"/internal/sync/roster","type":0,"val":"roster","end":""}],
    types: placeholder as Registry['sync.roster']['types'],
  },
  'sync.status': {
    methods: ["GET","HEAD"],
    pattern: '/internal/sync/status',
    tokens: [{"old":"/internal/sync/status","type":0,"val":"internal","end":""},{"old":"/internal/sync/status","type":0,"val":"sync","end":""},{"old":"/internal/sync/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['sync.status']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
