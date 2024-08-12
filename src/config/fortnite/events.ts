export enum EventNotification {
  MEMBER_CONNECTED = 'com.epicgames.social.party.notification.v0.MEMBER_CONNECTED',
  MEMBER_DISCONNECTED = 'com.epicgames.social.party.notification.v0.MEMBER_DISCONNECTED',
  MEMBER_EXPIRED = 'com.epicgames.social.party.notification.v0.MEMBER_EXPIRED',
  MEMBER_JOINED = 'com.epicgames.social.party.notification.v0.MEMBER_JOINED',
  MEMBER_LEFT = 'com.epicgames.social.party.notification.v0.MEMBER_LEFT',
  MEMBER_STATE_UPDATED = 'com.epicgames.social.party.notification.v0.MEMBER_STATE_UPDATED',
  PARTY_UPDATED = 'com.epicgames.social.party.notification.v0.PARTY_UPDATED',

  INTERACTION_NOTIFICATION = 'com.epicgames.social.interactions.notification.v2',
}

export enum ServiceEvent {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  SESSION_STARTED = 'session:started',

  DESTROY = 'destroy',
}

export enum PartyState {
  MATCHMAKING = 'Matchmaking',
  POST_MATCHMAKING = 'PostMatchmaking',
  THEATER_VIEW = 'TheaterView',
  WORLD_VIEW = 'WorldView',
}
