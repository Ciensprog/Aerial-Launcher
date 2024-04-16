export const electronAPIEventKeys = {
  /**
   * General Methods
   */

  openExternalURL: 'open-external-url',

  requestAccounts: 'request:accounts',

  /**
   * Events
   */

  onAccountsLoaded: 'on:accounts-loaded',
  onRemoveAccount: 'on:account-remove',

  /**
   * Authentication
   */

  createAuthWithExchange: 'auth:create:exchange',
  responseAuthWithExchange: 'auth:create:exchange:response',

  createAuthWithAuthorization: 'auth:create:authorization',
  responseAuthWithAuthorization: 'auth:create:authorization:response',
}
