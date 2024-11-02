import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'

import { cn } from '../../../lib/utils'

export function AppsettingsCustomMenu() {
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
  return (
    <div className="category">
      <div className="item main">
        <Label
          className="title text-lg"
          htmlFor="stw-operations"
        >
          STW Operations
        </Label>
        <Switch id="stw-operations" />
      </div>
      <div className="list">
        <div className="item">
          <Label
            className="title"
            htmlFor="auto-kick"
          >
            Auto-kick
          </Label>
          <Switch id="auto-kick" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="party"
          >
            Party
          </Label>
          <Switch id="party" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="save-quests"
          >
            Save Quests
          </Label>
          <Switch id="save-quests" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="homebase-name"
          >
            Homebase name
          </Label>
          <Switch id="homebase-name" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="xp-boosts"
          >
            XP Boosts
          </Label>
          <Switch id="xp-boosts" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="auto-pin-urns"
          >
            Auto-pin Urns
          </Label>
          <Switch id="auto-pin-urns" />
        </div>
      </div>
    </div>
  )
}

function AccountManagementSection() {
  return (
    <div className="category">
      <div className="item main">
        <Label
          className="title text-lg"
          htmlFor="account-management"
        >
          Account Management
        </Label>
        <Switch id="account-management" />
      </div>
      <div className="list">
        <div className="item">
          <Label
            className="title"
            htmlFor="vbucks-information"
          >
            V-Bucks Information
          </Label>
          <Switch id="vbucks-information" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="redeem-codes"
          >
            Redeem Codes
          </Label>
          <Switch id="redeem-codes" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="devices-auth"
          >
            Devices Auth
          </Label>
          <Switch id="devices-auth" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="epic-games-settings"
          >
            Epic Games Settings
          </Label>
          <Switch id="epic-games-settings" />
        </div>
      </div>
    </div>
  )
}

function AdvancedModeSection() {
  return (
    <div className="category">
      <div className="item main">
        <Label
          className="title text-lg"
          htmlFor="advanced-mode"
        >
          Advanced Mode
        </Label>
        <Switch id="advanced-mode" />
      </div>
      <div className="list">
        <div className="item">
          <Label
            className="title"
            htmlFor="matchmaking-track"
          >
            Matchmaking Track
          </Label>
          <Switch id="matchmaking-track" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="world-info"
          >
            World Info
          </Label>
          <Switch id="world-info" />
        </div>
      </div>
    </div>
  )
}

function MyAccountsSection() {
  return (
    <div className="category">
      <div className="item main">
        <Label
          className="title text-lg"
          htmlFor="my-accounts"
        >
          My Accounts
        </Label>
        <Switch id="my-accounts" />
      </div>
      <div className="list">
        <div className="item">
          <Label
            className="title"
            htmlFor="authorization-code"
          >
            Authorization Code
          </Label>
          <Switch id="authorization-code" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="exchange-code"
          >
            Exchange Code
          </Label>
          <Switch id="exchange-code" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="device-auth"
          >
            Device Auth
          </Label>
          <Switch id="device-auth" />
        </div>
        <div className="item">
          <Label
            className="title"
            htmlFor="remove-account"
          >
            Remove Account
          </Label>
          <Switch id="remove-account" />
        </div>
      </div>
    </div>
  )
}
