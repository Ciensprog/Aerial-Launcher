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
  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardDescription>
          You can customize menu sections/options visibility.
        </CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          'p-6 space-y-4',
          '[&_.category:not(:last-child)]:border-b [&_.category:not(:last-child)]:pb-4',
          '[&_.list]:gap-x-6 [&_.list]:gap-y-1 [&_.list]:grid [&_.list]:grid-cols-2',
          '[&_.title]:flex-1 [&_.title]:cursor-pointer',
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
          STW Operations
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
            Auto-kick
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
            Party
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
            Save Quests
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
            htmlFor="homebase-name"
          >
            Homebase name
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
            XP Boosts
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
            Auto-pin Urns
          </Label>
          <Switch
            id="auto-pin-urns"
            checked={getMenuOptionVisibility('autoPinUrns')}
            onCheckedChange={updateMenuOption('autoPinUrns')}
          />
        </div>
      </div>
    </div>
  )
}

function AccountManagementSection() {
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
          Account Management
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
            V-Bucks Information
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
            Redeem Codes
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
            Devices Auth
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
            Epic Games Settings
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
          Advanced Mode
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
            Matchmaking Track
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
            World Info
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
          My Accounts
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
            Show Total Accounts
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
            Authorization Code
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
            Exchange Code
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
            Device Auth
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
            Remove Account
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
