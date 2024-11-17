import { ExternalLink } from 'lucide-react'

import { fortniteDBProfileURL } from '../../../config/fortnite/links'

import {
  AccountBasicInformationSection,
  ExternalAuthTypeImage,
} from '../../../routes/stw-operations/xpboosts/route'

import { useAlertsDoneData } from '../../../hooks/alerts/alerts-done'
import { usePlayerData, usePlayerDataActions } from './-hooks'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { extractCommanderLevel } from '../../../lib/parsers/query-profile'
import { whatIsThis } from '../../../lib/callbacks'
import { dateWithFormat } from '../../../lib/dates'

export function BasicInformation() {
  const { playerData } = useAlertsDoneData()
  const { handleOpenExternalFNDBProfileUrl } = usePlayerDataActions()
  const { missions } = usePlayerData()

  const firstMission = missions.last()
  const lastMission = missions.first()
  const firstDate = firstMission
    ? dateWithFormat(
        firstMission.redemptionDateUtc,
        'MM/DD/YYYY hh:mm:ss a'
      )
    : 'N/A'
  const lastDate = lastMission
    ? dateWithFormat(
        lastMission.redemptionDateUtc,
        'MM/DD/YYYY hh:mm:ss a'
      )
    : 'N/A'

  if (!playerData?.data) {
    return null
  }

  return (
    <div className="mt-6">
      <div>
        <div>
          <a
            href={fortniteDBProfileURL(playerData.data.lookup.id)}
            className="inline-flex gap-2 items-center hover:opacity-75"
            onClick={handleOpenExternalFNDBProfileUrl(
              playerData.data.lookup.id
            )}
            onAuxClick={whatIsThis()}
          >
            <ExternalAuthTypeImage
              externalAuthType={playerData.data.lookup.externalAuthType}
            />
            <span className="max-w-72 text-lg truncate">
              {playerData.data.lookup.displayName}
            </span>
            <ExternalLink
              className="stroke-muted-foreground"
              size={16}
            />
          </a>
        </div>
        <div className="border-l-4 pl-3 space-y-0.5 text-muted-foreground text-sm [&_.icon-wrapper]:flex [&_.icon-wrapper]:items-center [&_.icon-wrapper]:justify-center [&_.icon-wrapper]:size-5">
          {playerData.isPrivate ? (
            <>
              <AccountBasicInformationSection
                title="Account Id:"
                value={playerData.data.lookup.id}
              />
              <div className="py-1.5">
                <div>Note:</div>
                This user has "Public Game Stats" disabled, more
                information can't be displayed.
              </div>
            </>
          ) : (
            playerData.success && (
              <>
                <AccountBasicInformationSection
                  title="Account Id:"
                  value={playerData.data.lookup.id}
                />
                <AccountBasicInformationSection
                  title="Commander Level:"
                  value={numberWithCommaSeparator(
                    extractCommanderLevel(playerData.data.profileChanges)
                      .total
                  )}
                />
                <div className="pt-2">
                  <AccountBasicInformationSection
                    title="Claim started at:"
                    value={firstDate}
                  />
                  <AccountBasicInformationSection
                    title="Last alert claimed at:"
                    value={lastDate}
                  />
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}
