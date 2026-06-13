import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.confidentialite': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'legal.support': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.guest': { paramsTuple?: []; params?: {} }
    'auth.upgrade': { paramsTuple?: []; params?: {} }
    'auth.apple': { paramsTuple?: []; params?: {} }
    'auth.google': { paramsTuple?: []; params?: {} }
    'auth_google.redirect': { paramsTuple?: []; params?: {} }
    'auth_google.handle_callback': { paramsTuple?: []; params?: {} }
    'auth_facebook.redirect': { paramsTuple?: []; params?: {} }
    'auth_facebook.handle_callback': { paramsTuple?: []; params?: {} }
    'auth.update_me': { paramsTuple?: []; params?: {} }
    'activations.activate': { paramsTuple?: []; params?: {} }
    'password_resets.forgot': { paramsTuple?: []; params?: {} }
    'password_resets.reset': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'pokemon.index': { paramsTuple?: []; params?: {} }
    'pokemon.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'item.index': { paramsTuple?: []; params?: {} }
    'meta.index': { paramsTuple?: []; params?: {} }
    'meta.show': { paramsTuple: [ParamValue]; params: {'name': ParamValue} }
    'roster.index': { paramsTuple?: []; params?: {} }
    'team.index': { paramsTuple?: []; params?: {} }
    'team.store': { paramsTuple?: []; params?: {} }
    'team.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'team.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'team.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'team.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'community.index': { paramsTuple?: []; params?: {} }
    'community.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'community.like': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'comment.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'comment.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscription.status': { paramsTuple?: []; params?: {} }
    'webhook.revenuecat': { paramsTuple?: []; params?: {} }
    'admin.sync_pokemon': { paramsTuple?: []; params?: {} }
    'sync.pikalytics': { paramsTuple?: []; params?: {} }
    'sync.smogon': { paramsTuple?: []; params?: {} }
    'sync.roster': { paramsTuple?: []; params?: {} }
    'sync.status': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.confidentialite': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'legal.support': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'auth_google.redirect': { paramsTuple?: []; params?: {} }
    'auth_google.handle_callback': { paramsTuple?: []; params?: {} }
    'auth_facebook.redirect': { paramsTuple?: []; params?: {} }
    'auth_facebook.handle_callback': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'pokemon.index': { paramsTuple?: []; params?: {} }
    'pokemon.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'item.index': { paramsTuple?: []; params?: {} }
    'meta.index': { paramsTuple?: []; params?: {} }
    'meta.show': { paramsTuple: [ParamValue]; params: {'name': ParamValue} }
    'roster.index': { paramsTuple?: []; params?: {} }
    'team.index': { paramsTuple?: []; params?: {} }
    'team.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'community.index': { paramsTuple?: []; params?: {} }
    'community.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'comment.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscription.status': { paramsTuple?: []; params?: {} }
    'sync.status': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.confidentialite': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'legal.support': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'auth_google.redirect': { paramsTuple?: []; params?: {} }
    'auth_google.handle_callback': { paramsTuple?: []; params?: {} }
    'auth_facebook.redirect': { paramsTuple?: []; params?: {} }
    'auth_facebook.handle_callback': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'pokemon.index': { paramsTuple?: []; params?: {} }
    'pokemon.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'item.index': { paramsTuple?: []; params?: {} }
    'meta.index': { paramsTuple?: []; params?: {} }
    'meta.show': { paramsTuple: [ParamValue]; params: {'name': ParamValue} }
    'roster.index': { paramsTuple?: []; params?: {} }
    'team.index': { paramsTuple?: []; params?: {} }
    'team.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'community.index': { paramsTuple?: []; params?: {} }
    'community.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'comment.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscription.status': { paramsTuple?: []; params?: {} }
    'sync.status': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.guest': { paramsTuple?: []; params?: {} }
    'auth.upgrade': { paramsTuple?: []; params?: {} }
    'auth.apple': { paramsTuple?: []; params?: {} }
    'auth.google': { paramsTuple?: []; params?: {} }
    'activations.activate': { paramsTuple?: []; params?: {} }
    'password_resets.forgot': { paramsTuple?: []; params?: {} }
    'password_resets.reset': { paramsTuple?: []; params?: {} }
    'team.store': { paramsTuple?: []; params?: {} }
    'team.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'community.like': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'comment.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'webhook.revenuecat': { paramsTuple?: []; params?: {} }
    'admin.sync_pokemon': { paramsTuple?: []; params?: {} }
    'sync.pikalytics': { paramsTuple?: []; params?: {} }
    'sync.smogon': { paramsTuple?: []; params?: {} }
    'sync.roster': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'auth.update_me': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'profile.update': { paramsTuple?: []; params?: {} }
    'team.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'team.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}