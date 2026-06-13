/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'legal.confidentialite': {
    methods: ["GET","HEAD"]
    pattern: '/confidentialite'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'legal.privacy': {
    methods: ["GET","HEAD"]
    pattern: '/privacy'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'legal.support': {
    methods: ["GET","HEAD"]
    pattern: '/support'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'new_account.create': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
  'auth.register': {
    methods: ["POST"]
    pattern: '/api/v1/auth/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').registerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').registerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['register']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['register']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.guest': {
    methods: ["POST"]
    pattern: '/api/v1/auth/guest'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['guest']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['guest']>>>
    }
  }
  'auth.upgrade': {
    methods: ["POST"]
    pattern: '/api/v1/auth/upgrade'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').registerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').registerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['upgrade']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['upgrade']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.apple': {
    methods: ["POST"]
    pattern: '/api/v1/auth/apple'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['apple']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['apple']>>>
    }
  }
  'auth.google': {
    methods: ["POST"]
    pattern: '/api/v1/auth/google'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['google']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['google']>>>
    }
  }
  'auth_google.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/google/redirect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_google_controller').default['redirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_google_controller').default['redirect']>>>
    }
  }
  'auth_google.handle_callback': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/google/signin/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_google_controller').default['handleCallback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_google_controller').default['handleCallback']>>>
    }
  }
  'auth_facebook.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/facebook/redirect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_facebook_controller').default['redirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_facebook_controller').default['redirect']>>>
    }
  }
  'auth_facebook.handle_callback': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/facebook/signin/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_facebook_controller').default['handleCallback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_facebook_controller').default['handleCallback']>>>
    }
  }
  'auth.update_me': {
    methods: ["PATCH"]
    pattern: '/api/v1/me'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').updateMeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').updateMeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['updateMe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['updateMe']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'activations.activate': {
    methods: ["POST"]
    pattern: '/api/v1/user/activate'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/activation/activations_controller').default['activate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/activation/activations_controller').default['activate']>>>
    }
  }
  'password_resets.forgot': {
    methods: ["POST"]
    pattern: '/api/v1/user/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset/password_resets_controller').default['forgot']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset/password_resets_controller').default['forgot']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password_resets.reset': {
    methods: ["POST"]
    pattern: '/api/v1/user/reset-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').resetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset/password_resets_controller').default['reset']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset/password_resets_controller').default['reset']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.update': {
    methods: ["PUT"]
    pattern: '/api/v1/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile').upsertProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile').upsertProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'pokemon.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/pokemon'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pokemon_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pokemon_controller').default['index']>>>
    }
  }
  'pokemon.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/pokemon/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pokemon_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pokemon_controller').default['show']>>>
    }
  }
  'item.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/items'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_controller').default['index']>>>
    }
  }
  'meta.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/meta'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/meta_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/meta_controller').default['index']>>>
    }
  }
  'meta.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/meta/:name'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { name: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/meta_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/meta_controller').default['show']>>>
    }
  }
  'roster.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/roster'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/roster_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/roster_controller').default['index']>>>
    }
  }
  'team.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/teams'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/team_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/team_controller').default['index']>>>
    }
  }
  'team.store': {
    methods: ["POST"]
    pattern: '/api/v1/teams'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/team').storeTeamValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/team').storeTeamValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/team_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/team_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'team.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/teams/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/team_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/team_controller').default['show']>>>
    }
  }
  'team.update': {
    methods: ["PUT"]
    pattern: '/api/v1/teams/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/team').updateTeamValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/team').updateTeamValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/team_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/team_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'team.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/teams/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/team_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/team_controller').default['destroy']>>>
    }
  }
  'team.publish': {
    methods: ["POST"]
    pattern: '/api/v1/teams/:id/publish'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/team_controller').default['publish']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/team_controller').default['publish']>>>
    }
  }
  'community.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/community'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/community_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/community_controller').default['index']>>>
    }
  }
  'community.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/community/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/community_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/community_controller').default['show']>>>
    }
  }
  'community.like': {
    methods: ["POST"]
    pattern: '/api/v1/community/:id/like'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/community_controller').default['like']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/community_controller').default['like']>>>
    }
  }
  'comment.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/community/:id/comments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/comment_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/comment_controller').default['index']>>>
    }
  }
  'comment.store': {
    methods: ["POST"]
    pattern: '/api/v1/community/:id/comments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/team').storeCommentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/team').storeCommentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/comment_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/comment_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'subscription.status': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/subscription/status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_controller').default['status']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_controller').default['status']>>>
    }
  }
  'webhook.revenuecat': {
    methods: ["POST"]
    pattern: '/api/v1/webhooks/revenuecat'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['revenuecat']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['revenuecat']>>>
    }
  }
  'admin.sync_pokemon': {
    methods: ["POST"]
    pattern: '/api/v1/admin/sync-pokemon'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['syncPokemon']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['syncPokemon']>>>
    }
  }
  'sync.pikalytics': {
    methods: ["POST"]
    pattern: '/internal/sync/meta/pikalytics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_controller').default['pikalytics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_controller').default['pikalytics']>>>
    }
  }
  'sync.smogon': {
    methods: ["POST"]
    pattern: '/internal/sync/meta/smogon'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_controller').default['smogon']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_controller').default['smogon']>>>
    }
  }
  'sync.roster': {
    methods: ["POST"]
    pattern: '/internal/sync/roster'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_controller').default['roster']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_controller').default['roster']>>>
    }
  }
  'sync.status': {
    methods: ["GET","HEAD"]
    pattern: '/internal/sync/status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_controller').default['status']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_controller').default['status']>>>
    }
  }
}
