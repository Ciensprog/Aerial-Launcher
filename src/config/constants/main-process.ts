export enum ElectronAPIEventKeys {
  /**
   * Paths
   */

  GetMatchmakingTrackPath = 'on:load:get:matchmaking-track:path',
  GetMatchmakingTrackPathNotification = 'on:load:get:matchmaking-track:path:notification',

  /**
   * Settings
   */

  AppLanguageRequest = 'settings:language:request',
  AppLanguageInit = 'settings:language:init',
  AppLanguageNotification = 'settings:language:notification',
  AppLanguageUpdate = 'settings:language:update',

  SettingsDetectPath = 'settings:detect:path',

  RequestSettings = 'request:settings',
  OnLoadSettings = 'on:load:settings',
  UpdateSettings = 'settings:update',

  CustomProcessKill = 'custom-process:kill',
  CustomProcessStatus = 'custom-process:status',

  DevSettingsRequest = 'dev-settings:request',
  DevSettingsResponse = 'dev-settings:response',

  CustomizableMenuSettingsRequest = 'customizable-menu-settings:request',
  CustomizableMenuSettingsResponse = 'customizable-menu-settings:response',
  CustomizableMenuSettingsUpdate = 'customizable-menu-settings:update',
  CustomizableMenuSettingsUpdateLayout = 'customizable-menu-settings:update-layout',

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

  AccountsOrderingSync = 'accounts-ordering:sync',

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

  EULAVerificationRequest = 'eula:request',
  EULAVerificationResponse = 'eula:response',

  /**
   * Launcher
   */

  LauncherStart = 'launcher:start',
  LauncherGenerateCmd = 'launcher:generate-cmd',
  LauncherNotification = 'launcher:notification',

  GamesLauncherScan = 'games-launcher:scan',
  GamesLauncherStart = 'games-launcher:start',
  GamesLauncherNotification = 'games-launcher:notification',
  GamesLauncherPickDir = 'games-launcher:pick-dir',

  /**
   * STW Operations
   */

  SetSaveQuests = 'save-quests:set',
  SaveQuestsNotification = 'save-quests:notification',

  DailyQuestsRequest = 'daily-quests:request',
  DailyQuestsNotification = 'daily-quests:notification',
  DailyQuestReroll = 'daily-quests:reroll',
  DailyQuestRerollNotification = 'daily-quests:reroll:notification',

  DqWeaponsRequest = 'dq-weapons:request',
  DqWeaponsNotification = 'dq-weapons:notification',
  DqWeaponsFavoriteRequest = 'dq-weapons:favorite:request',
  DqWeaponsFavoriteNotification = 'dq-weapons:favorite:notification',

  StormShieldsRequest = 'storm-shields:request',
  StormShieldsNotification = 'storm-shields:notification',

  AccountInfoRequest = 'account-info:request',
  AccountInfoNotification = 'account-info:notification',
  AccountInfoRecycleRequest = 'account-info:recycle:request',
  AccountInfoUpgradeRequest = 'account-info:upgrade:request',
  AccountInfoActionNotification = 'account-info:action:notification',

  CloudStorageListRequest = 'cloud-storage:list:request',
  CloudStorageListNotification = 'cloud-storage:list:notification',
  CloudStorageDownloadRequest = 'cloud-storage:download:request',
  CloudStorageDownloadNotification = 'cloud-storage:download:notification',
  CloudStoragePickRequest = 'cloud-storage:pick:request',
  CloudStoragePickNotification = 'cloud-storage:pick:notification',
  CloudStorageApplyRequest = 'cloud-storage:apply:request',
  CloudStorageApplyNotification = 'cloud-storage:apply:notification',

  AccountExportRequest = 'account-export:request',
  AccountExportNotification = 'account-export:notification',

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

  UnlockRequest = 'unlock:request',
  UnlockNotification = 'unlock:notification',

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
  PartySendFriendRequestAction = 'party:friend:request',
  PartySendFriendRequestActionNotification = 'party:friend:request:notification',
  PartyLookupPlayerAction = 'party:player:lookup',
  PartyLookupPlayerActionNotification = 'party:player:lookup:notification',
  PartyIncomingFriendRequestsRequest = 'party:friend:incoming:request',
  PartyIncomingFriendRequestsNotification = 'party:friend:incoming:notification',
  PartyAcceptIncomingFriendRequests = 'party:friend:incoming:accept',
  PartyAcceptIncomingFriendRequestsNotification = 'party:friend:incoming:accept:notification',
  PartyRemoveFriendAction = 'party:friend:remove',
  PartyRemoveFriendActionNotification = 'party:friend:remove:notification',
  PartyStatusRequest = 'party:status:request',
  PartyStatusNotification = 'party:status:notification',
  PartyStatusKickMember = 'party:status:kick-member',
  PartyStatusPromoteMember = 'party:status:promote-member',
  PartyStatusLeave = 'party:status:leave',
  PartyStatusActionNotification = 'party:status:action:notification',

  /**
   * Advanced Mode
   */

  HomeWorldInfoRequest = 'home:world-info:request',
  HomeWorldInfoResponse = 'home:world-info:response',
  HomeFetchPlayerRequest = 'home:fetch-player:request',
  HomeFetchPlayerResponse = 'home:fetch-player:response',
  AlertsDoneCheckRequest = 'alerts-done:check:request',
  AlertsDoneCheckNotification = 'alerts-done:check:notification',

  WorldInfoGetSwapSources = 'advanced-mode:world-info:swap-sources',
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
  AutomationServiceReload = 'automation:service:reload',
  AutomationServiceReloadNotification = 'automation:service:reload:notification',
  AutomationServiceRemove = 'automation:service:remove',
  AutomationServiceRemoveNotification = 'automation:service:remove:notification',
  AutomationServiceActionUpdate = 'automation:service:action:update',
  AutomationServiceActionUpdateNotification = 'automation:service:action:update:notification',

  AutomationLogFileRequest = 'automation:logfile:request',
  AutomationLogFileUpdate = 'automation:logfile:update',
  AutomationLogFilePick = 'automation:logfile:pick',
  AutomationLogFileNotification = 'automation:logfile:notification',

  /**
   * Taxi Service
   */

  TaxiServiceServiceRequestData = 'taxi-service:service:request:data',
  TaxiServiceServiceAddAccounts = 'taxi-service:service:add',
  // TaxiServiceServiceAddAccountsNotification = 'taxi-service:service:add:notification',
  TaxiServiceServiceResponseData = 'taxi-service:service:response:data',
  TaxiServiceServiceStart = 'taxi-service:service:start',
  TaxiServiceServiceStartNotification = 'taxi-service:service:start:notification',
  TaxiServiceServiceReload = 'taxi-service:service:reload',
  TaxiServiceServiceReloadNotification = 'taxi-service:service:reload:notification',
  TaxiServiceServiceRemove = 'taxi-service:service:remove',
  TaxiServiceServiceRemoveNotification = 'taxi-service:service:remove:notification',
  TaxiServiceServiceActionUpdate = 'taxi-service:service:action:update',
  TaxiServiceServiceActionUpdateNotification = 'taxi-service:service:action:update:notification',

  TaxiServiceServiceNotifications = 'taxi-service:service:notifications',

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
   * Auto-llamas
   */

  AutoLlamasLoadAccountsRequest = 'auto-llamas:load:accounts:request',
  AutoLlamasLoadAccountsResponse = 'auto-llamas:load:accounts:response',
  AutoLlamasAccountAdd = 'auto-llamas:account:add',
  AutoLlamasAccountUpdate = 'auto-llamas:account:update',
  AutoLlamasAccountRemove = 'auto-llamas:account:remove',
  AutoLlamasAccountCheck = 'auto-llamas:account:check',
  AutoLlamasAccountCheckLoading = 'auto-llamas:account:check:loading',

  /**
   * Llama Manager
   */

  LlamaManagerRequestData = 'llama-manager:request:data',
  LlamaManagerResponseData = 'llama-manager:response:data',
  LlamaManagerLoadingDone = 'llama-manager:loading:done',
  LlamaManagerPurchase = 'llama-manager:purchase',
  LlamaManagerBulkPurchase = 'llama-manager:bulk:purchase',
  LlamaManagerBulkResult = 'llama-manager:bulk:result',
  /** @deprecated kept for older builds */
  LlamaManagerBulkPurchaseMini = 'llama-manager:bulk:purchase:mini',
  LlamaManagerBulkMiniResult = 'llama-manager:bulk:mini:result',
  LlamaManagerOpenPacks = 'llama-manager:open:packs',
  LlamaManagerOpenChoice = 'llama-manager:open:choice',
  LlamaManagerActionResult = 'llama-manager:action:result',

  /**
   * Item Shop
   */

  ItemShopCatalogRequest = 'item-shop:catalog:request',
  ItemShopCatalogResponse = 'item-shop:catalog:response',
  ItemShopLoadCache = 'item-shop:cache:load',
  ItemShopGiftHistoryRequest = 'item-shop:gifts:request',
  ItemShopGiftHistoryResponse = 'item-shop:gifts:response',
  ItemShopAccountsRequest = 'item-shop:accounts:request',
  ItemShopAccountResponse = 'item-shop:account:response',
  ItemShopAccountsDone = 'item-shop:accounts:done',
  ItemShopCreatorCode = 'item-shop:creator-code',
  ItemShopCreatorCodeResult = 'item-shop:creator-code:result',
  ItemShopPurchase = 'item-shop:purchase',
  ItemShopPurchaseResult = 'item-shop:purchase:result',
  ItemShopGift = 'item-shop:gift',
  ItemShopGiftResult = 'item-shop:gift:result',

  /**
   * Collection Book Manager
   */

  CollectionBookRequestData = 'collection-book:request:data',
  CollectionBookResponseData = 'collection-book:response:data',
  CollectionBookLoadingDone = 'collection-book:loading:done',
  CollectionBookUpgrade = 'collection-book:upgrade',
  CollectionBookSlot = 'collection-book:slot',
  CollectionBookActionResult = 'collection-book:action:result',

  /**
   * V-Bucks Information
   */

  VBucksInformationRequest = 'vbucks-information:request:data',
  VBucksInformationResponseData = 'vbucks-information:response:data',

  /**
   * Redeem Codes
   */

  RedeemCodesRedeem = 'redeem-codes:redeem',
  RedeemCodesRedeenNotification = 'redeem-codes:redeem:notification',

  /**
   * Devices Auth Management
   */

  DevicesAuthRequestData = 'devices-auth:request:data',
  DevicesAuthResponseData = 'devices-auth:response:data',
  DevicesAuthRemove = 'devices-auth:remove',
  DevicesAuthRemoveNotification = 'devices-auth:remove:notification',

  /**
   * Schedules
   */

  ScheduleRequestAccounts = 'schedule:request:accounts',
  ScheduleResponseAccounts = 'schedule:response:accounts',

  ScheduleResponseProviders = 'schedule:response:providers',
}
