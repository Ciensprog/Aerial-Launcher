import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'

import {
  useCustomizableMenuSettingsActions,
  useCustomizableMenuSettingsVisibility,
} from '../../../hooks/settings'

import { cn } from '../../../lib/utils'

export function CustomizableMenu() {
  const { t } = useTranslation(['settings'])

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardDescription>{t('custom-menu.description')}</CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          'p-6 space-y-4',
          '[&_.category:not(:last-child)]:border-b [&_.category:not(:last-child)]:pb-4',
          '[&_.list]:gap-x-6 [&_.list]:gap-y-1 [&_.list]:grid [&_.list]:grid-cols-2',
          '[&_.title]:flex-1 [&_.title]:cursor-pointer [&_.title]:leading-4',
          '[&_.item]:flex [&_.item]:items-center [&_.item]:justify-between [&_.item.main]:mb-2'
        )}
      >
        <STWOperationsSection />
        <AccountManagementSection />
        <AdvancedModeSection />
        <MyAccountsSection />
      </CardContent>
    </Card>
  )
}

function STWOperationsSection() {
  const { t } = useTranslation(['sidebar'])

  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()
  const { updateMenuOption } = useCustomizableMenuSettingsActions()

  return (
    <div className="category">
      <div className="item main">
        <Label
          className="title text-lg"
          htmlFor="stw-operations"
        >
          {t('stw-operations.title')}
        </Label>
        <Switch
          id="stw-operations"
          checked={getMenuOptionVisibility('stwOperations')}
          onCheckedChange={updateMenuOption('stwOperations')}
        />
      </div>
      <div className="list">
        <div className="item">
          <Label
            className="title"
            htmlFor="auto-kick"
          >
            {t('stw-operations.options.auto-kick')}
          </Label>
          <Switch
            id="auto-kick"
            checked={getMenuOptionVisibility('autoKick')}
            onCheckedChange={updateMenuOption('autoKick')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="party"
          >
            {t('stw-operations.options.party')}
          </Label>
          <Switch
            id="party"
            checked={getMenuOptionVisibility('party')}
            onCheckedChange={updateMenuOption('party')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="save-quests"
          >
            {t('stw-operations.options.save-quests')}
          </Label>
          <Switch
            id="save-quests"
            checked={getMenuOptionVisibility('saveQuests')}
            onCheckedChange={updateMenuOption('saveQuests')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="daily-quests"
          >
            {t('stw-operations.options.daily-quests')}
          </Label>
          <Switch
            id="daily-quests"
            checked={getMenuOptionVisibility('dailyQuests')}
            onCheckedChange={updateMenuOption('dailyQuests')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="homebase-name"
          >
            {t('stw-operations.options.homebase-name')}
          </Label>
          <Switch
            id="homebase-name"
            checked={getMenuOptionVisibility('homebaseName')}
            onCheckedChange={updateMenuOption('homebaseName')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="xp-boosts"
          >
            {t('stw-operations.options.xp-boosts')}
          </Label>
          <Switch
            id="xp-boosts"
            checked={getMenuOptionVisibility('xpBoosts')}
            onCheckedChange={updateMenuOption('xpBoosts')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="auto-pin-urns"
          >
            {t('stw-operations.options.auto-pin-urns')}
          </Label>
          <Switch
            id="auto-pin-urns"
            checked={getMenuOptionVisibility('autoPinUrns')}
            onCheckedChange={updateMenuOption('autoPinUrns')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="auto-llamas"
          >
            {t('stw-operations.options.auto-llamas')}
          </Label>
          <Switch
            id="auto-llamas"
            checked={getMenuOptionVisibility('autoLlamas')}
            onCheckedChange={updateMenuOption('autoLlamas')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="unlock"
          >
            {t('stw-operations.options.unlock')}
          </Label>
          <Switch
            id="unlock"
            checked={getMenuOptionVisibility('unlock')}
            onCheckedChange={updateMenuOption('unlock')}
          />
        </div>
      </div>
    </div>
  )
}

function AccountManagementSection() {
  const { t } = useTranslation(['sidebar'])

  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()
  const { updateMenuOption } = useCustomizableMenuSettingsActions()

  return (
    <div className="category">
      <div className="item main">
        <Label
          className="title text-lg"
          htmlFor="account-management"
        >
          {t('account-management.title')}
        </Label>
        <Switch
          id="account-management"
          checked={getMenuOptionVisibility('accountManagement')}
          onCheckedChange={updateMenuOption('accountManagement')}
        />
      </div>
      <div className="list">
        <div className="item">
          <Label
            className="title"
            htmlFor="vbucks-information"
          >
            {t('account-management.options.vbucks-information')}
          </Label>
          <Switch
            id="vbucks-information"
            checked={getMenuOptionVisibility('vbucksInformation')}
            onCheckedChange={updateMenuOption('vbucksInformation')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="redeem-codes"
          >
            {t('account-management.options.redeem-codes')}
          </Label>
          <Switch
            id="redeem-codes"
            checked={getMenuOptionVisibility('redeemCodes')}
            onCheckedChange={updateMenuOption('redeemCodes')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="devices-auth"
          >
            {t('account-management.options.devices-auth')}
          </Label>
          <Switch
            id="devices-auth"
            checked={getMenuOptionVisibility('devicesAuth')}
            onCheckedChange={updateMenuOption('devicesAuth')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="epic-games-settings"
          >
            {t('account-management.options.epic-settings')}
          </Label>
          <Switch
            id="epic-games-settings"
            checked={getMenuOptionVisibility('epicGamesSettings')}
            onCheckedChange={updateMenuOption('epicGamesSettings')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="eula"
          >
            EULA
          </Label>
          <Switch
            id="eula"
            checked={getMenuOptionVisibility('eula')}
            onCheckedChange={updateMenuOption('eula')}
          />
        </div>
      </div>
    </div>
  )
}

function AdvancedModeSection() {
  const { t } = useTranslation(['sidebar'])

  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()
  const { updateMenuOption } = useCustomizableMenuSettingsActions()

  return (
    <div className="category">
      <div className="item main">
        <Label
          className="title text-lg"
          htmlFor="advanced-mode"
        >
          {t('advanced-mode.title')}
        </Label>
        <Switch
          id="advanced-mode"
          checked={getMenuOptionVisibility('advancedMode')}
          onCheckedChange={updateMenuOption('advancedMode')}
        />
      </div>
      <div className="list">
        <div className="item">
          <Label
            className="title"
            htmlFor="matchmaking-track"
          >
            {t('advanced-mode.options.matchmaking-track')}
          </Label>
          <Switch
            id="matchmaking-track"
            checked={getMenuOptionVisibility('matchmakingTrack')}
            onCheckedChange={updateMenuOption('matchmakingTrack')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="world-info"
          >
            {t('advanced-mode.options.world-info')}
          </Label>
          <Switch
            id="world-info"
            checked={getMenuOptionVisibility('worldInfo')}
            onCheckedChange={updateMenuOption('worldInfo')}
          />
        </div>
      </div>
    </div>
  )
}

function MyAccountsSection() {
  const { t } = useTranslation(['sidebar'])

  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()
  const { updateMenuOption } = useCustomizableMenuSettingsActions()

  return (
    <div className="category">
      <div className="item main">
        <Label
          className="title text-lg"
          htmlFor="my-accounts"
        >
          {t('accounts.title')}
        </Label>
        <Switch
          id="my-accounts"
          checked={getMenuOptionVisibility('myAccounts')}
          onCheckedChange={updateMenuOption('myAccounts')}
        />
      </div>
      <div className="list">
        <div className="item mb-1">
          <Label
            className="title"
            htmlFor="show-total-accounts"
          >
            {t('accounts.options.show-total-accounts')}
          </Label>
          <Switch
            id="show-total-accounts"
            checked={getMenuOptionVisibility('showTotalAccounts')}
            onCheckedChange={updateMenuOption('showTotalAccounts')}
          />
        </div>
      </div>
      <div className="list">
        <div className="item">
          <Label
            className="title"
            htmlFor="authorization-code"
          >
            {t('accounts.options.auth')}
          </Label>
          <Switch
            id="authorization-code"
            checked={getMenuOptionVisibility('authorizationCode')}
            onCheckedChange={updateMenuOption('authorizationCode')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="exchange-code"
          >
            {t('accounts.options.exchange')}
          </Label>
          <Switch
            id="exchange-code"
            checked={getMenuOptionVisibility('exchangeCode')}
            onCheckedChange={updateMenuOption('exchangeCode')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="device-auth"
          >
            {t('accounts.options.device')}
          </Label>
          <Switch
            id="device-auth"
            checked={getMenuOptionVisibility('deviceAuth')}
            onCheckedChange={updateMenuOption('deviceAuth')}
          />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="remove-account"
          >
            {t('accounts.options.remove')}
          </Label>
          <Switch
            id="remove-account"
            checked={getMenuOptionVisibility('removeAccount')}
            onCheckedChange={updateMenuOption('removeAccount')}
          />
        </div>
      </div>
    </div>
  )
}
