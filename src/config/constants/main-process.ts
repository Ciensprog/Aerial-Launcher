export enum ElectronAPIEventKeys {
  /**
   * Paths
   */

  GetMatchmakingTrackPath = 'on:load:get:matchmaking-track:path',
  GetMatchmakingTrackPathNotification = 'on:load:get:matchmaking-track:path:notification',

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

  SyncAccessToken = 'auth:access-token:sync',

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

  SetHombaseName = 'homebase-name:set',
  HomebaseNameNotification = 'homebase-name:notification',

  XPBoostsAccountProfileRequest = 'xpboosts:account-profile:request',
  XPBoostsAccountProfileResponse = 'xpboosts:account-profile:response',
  XPBoostsSearchUser = 'xpboosts:search:user',
  XPBoostsSearchUserNotification = 'xpboosts:search:user:notification',
  XPBoostsGeneralSearchUser = 'xpboosts:general-search:user',
  XPBoostsGeneralSearchUserNotification = 'xpboosts:general-search:user:notification',
  XPBoostsConsumePersonal = 'xpboosts:consume:personal',
  XPBoostsConsumePersonalNotification = 'xpboosts:consume:personal:notification',
  XPBoostsConsumeTeammate = 'xpboosts:consume:teammate',
  XPBoostsConsumeTeammateNotification = 'xpboosts:consume:teammate:notification',
  XPBoostsConsumeTeammateProgressionNotification = 'xpboosts:consume:teammate:progression:notification',

  /**
   * Party
   */

  PartyClaimAction = 'party:claim',
  PartyClaimActionNotification = 'party:claim:notification',
  PartyKickAction = 'party:kick',
  PartyKickActionNotification = 'party:kick:notification',
  PartyKickActionGlobalNotification = 'party:kick:global:notification',
  PartyLeaveAction = 'party:leave',
  PartyLeaveActionNotification = 'party:leave:notification',

  ClaimRewardsClientNotification = 'claim-rewards:client:notification',
  ClaimRewardsClientGlobalSyncNotification = 'claim-rewards:client:global:sync:notification',
  ClaimRewardsClientGlobalAutoClaimedNotification = 'claim-rewards:client:global-auto-claimed:notification',

  PartyLoadFriends = 'party:load:friends',
  PartyLoadFriendsNotification = 'party:load:friends:notification',
  PartyAddNewFriendAction = 'party:friend:add',
  PartyAddNewFriendActionNotification = 'party:friend:add:notification',
  PartyInviteAction = 'party:invite',
  PartyInviteActionNotification = 'party:invite:notification',
  PartyRemoveFriendAction = 'party:friend:remove',
  PartyRemoveFriendActionNotification = 'party:friend:remove:notification',

  /**
   * Advanced Mode
   */

  WorldInfoRequestData = 'advanced-mode:world-info:request:data',
  WorldInfoResponseData = 'advanced-mode:world-info:response:data',
  WorldInfoSaveFile = 'advanced-mode:world-info:save:file',
  WorldInfoSaveNotification = 'advanced-mode:world-info:save:notification',
  WorldInfoRequestFiles = 'advanced-mode:world-info:request:files',
  WorldInfoResponseFiles = 'advanced-mode:world-info:response:files',
  WorldInfoDeleteFile = 'advanced-mode:world-info:delete:file',
  WorldInfoDeleteNotification = 'advanced-mode:world-info:delete:notification',
  WorldInfoExportFile = 'advanced-mode:world-info:export:file',
  WorldInfoExportFileNotification = 'advanced-mode:world-info:export:notification',
  WorldInfoOpenFile = 'advanced-mode:world-info:open:file',
  WorldInfoOpenFileNotification = 'advanced-mode:world-info:open:notification',
  WorldInfoRenameFile = 'advanced-mode:world-info:rename:file',
  WorldInfoRenameFileNotification = 'advanced-mode:world-info:rename:notification',

  MatchmakingTrackSaveFile = 'advanced-mode:matchmaking-track:save:file',
  MatchmakingTrackSaveFileNotification = 'advanced-mode:matchmaking-track:save:file:notification',

  /**
   * Automation
   */

  AutomationServiceRequestData = 'automation:service:request:data',
  AutomationServiceResponseData = 'automation:service:response:data',
  AutomationServiceStart = 'automation:service:start',
  AutomationServiceStartNotification = 'automation:service:start:notification',
  // AutomationServiceReload = 'automation:service:reload',
  // AutomationServiceReloadNotification = 'automation:service:reload:notification',
  AutomationServiceRemove = 'automation:service:remove',
  AutomationServiceRemoveNotification = 'automation:service:remove:notification',
  AutomationServiceActionUpdate = 'automation:service:action:update',
  AutomationServiceActionUpdateNotification = 'automation:service:action:update:notification',

  /**
   * Urns
   */

  UrnsServiceRequestData = 'urns:service:request:data',
  UrnsServiceResponseData = 'urns:service:response:data',
  UrnsServiceAdd = 'urns:service:add',
  UrnsServiceAddNotification = 'urns:service:add:notification',
  UrnsServiceUpdate = 'urns:service:update',
  UrnsServiceUpdateNotification = 'urns:service:update:notification',
  UrnsServiceRemove = 'urns:service:remove',
  UrnsServiceRemoveNotification = 'urns:service:remove:notification',

  /**
   * Schedules
   */

  ScheduleRequestAccounts = 'schedule:request:accounts',
  ScheduleResponseAccounts = 'schedule:response:accounts',

  ScheduleResponseProviders = 'schedule:response:providers',
}
