export enum ElectronAPIEventKeys {
  /**
   * Settings
   */

  RequestSettings = 'request:settings',
  OnLoadSettings = 'on:load:settings',
  UpdateSettings = 'settings:update',

  RequestTags = 'request:tags',
  OnLoadTags = 'on:load:tags',
  UpdateTags = 'tags:update',
  NotificationCreationTag = 'notification:creation:tag',

  RequestGroups = 'request:groups',
  OnLoadGroups = 'on:load:groups',
  UpdateGroups = 'groups:update',

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
   * STW Operations
   */

  SetSaveQuests = 'save-quests:set',
  SaveQuestsNotification = 'save-quests:notification',

  /**
   * Party
   */

  PartyClaimAction = 'party:claim',
  PartyClaimActionNotification = 'party:claim:notification',
  PartyKickAction = 'party:kick',
  PartyKickActionNotification = 'party:kick:notification',
  PartyLeaveAction = 'party:leave',
  PartyLeaveActionNotification = 'party:leave:notification',

  ClaimRewardsClientNotification = 'claim-rewards:client:notification',

  /**
   * Schedules
   */

  ScheduleRequestAccounts = 'schedule:request:accounts',
  ScheduleResponseAccounts = 'schedule:response:accounts',

  ScheduleResponseProviders = 'schedule:response:providers',
}
