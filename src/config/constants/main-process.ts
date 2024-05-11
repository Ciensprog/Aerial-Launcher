export enum ElectronAPIEventKeys {
  /**
   * Settings
   */

  RequestSettings = 'request:settings',
  OnLoadSettings = 'on:load:settings',
  UpdateSettings = 'settings:update',

  UpdateTags = 'tags:update',
  OnLoadTags = 'on:load:tags',
  RequestTags = 'request:tags',
  NotificationCreationTag = 'notification:creation:tag',

  /**
   * General Methods
   */

  OpenExternalURL = 'open-external-url',

  CloseWindow = 'window:close',
  MinimizeWindow = 'window:minimize',

  /**
   * Events
   */

  OnAccountsLoaded = 'on:accounts-loaded',
  OnRemoveAccount = 'on:account-remove',

  /**
   * Requests
   */

  RequestNewVersionStatus = 'request:new-version-status',
  ResponseNewVersionStatus = 'response:new-version-status',

  RequestAccounts = 'request:accounts',

  RequestProviderAndAccessTokenOnStartup = 'request:provider-with-access-token:on-startup',
  ResponseProviderAndAccessTokenOnStartup = 'request:provider-with-access-token:on-startup:response',

  /**
   * Accounts
   */

  UpdateAccountBasicInfo = 'account:custom-display-name:update',
  ResponseUpdateAccountBasicInfo = 'account:custom-display-name:response',

  /**
   * Authentication
   */

  CreateAuthWithExchange = 'auth:create:exchange',
  ResponseAuthWithExchange = 'auth:create:exchange:response',

  CreateAuthWithAuthorization = 'auth:create:authorization',
  ResponseAuthWithAuthorization = 'auth:create:authorization:response',

  CreateAuthWithDevice = 'auth:create:device',
  ResponseAuthWithDevice = 'auth:create:device:response',

  OpenEpicGamesSettings = 'epicgames:open-settings',
  OpenEpicGamesSettingsNotification = 'epicgames:open-settings:notification',

  GenerateExchangeCode = 'auth:generate:exchange',
  ResponseGenerateExchangeCode = 'auth:generate:exchange:response',

  /**
   * Launcher
   */

  LauncherStart = 'launcher:start',
  LauncherNotification = 'launcher:notification',

  /**
   * Schedules
   */

  ScheduleRequestAccounts = 'schedule:request:accounts',
  ScheduleResponseAccounts = 'schedule:response:accounts',

  ScheduleResponseProviders = 'schedule:response:providers',
}
