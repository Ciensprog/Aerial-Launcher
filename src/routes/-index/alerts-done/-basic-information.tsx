import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
import { getShortDateFormat } from '../../../lib/dates'

export function BasicInformation() {
  const { t } = useTranslation(['alerts', 'general'])

  const { playerData } = useAlertsDoneData()
  const { handleOpenExternalFNDBProfileUrl } = usePlayerDataActions()
  const { missions } = usePlayerData()

  const firstMission = missions.last()
  const lastMission = missions.first()
  const firstDate = firstMission
    ? getShortDateFormat(firstMission.redemptionDateUtc)
    : 'N/A'
  const lastDate = lastMission
    ? getShortDateFormat(lastMission.redemptionDateUtc)
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
                title={t('information.account-id', {
                  ns: 'general',
                })}
                value={playerData.data.lookup.id}
              />
              <div className="py-1.5">
                {t('public-stats', {
                  ns: 'general',
                })}
              </div>
            </>
          ) : (
            playerData.success && (
              <>
                <AccountBasicInformationSection
                  title={t('information.account-id', {
                    ns: 'general',
                  })}
                  value={playerData.data.lookup.id}
                />
                <AccountBasicInformationSection
                  title={t('information.commander-level', {
                    ns: 'general',
                  })}
                  value={numberWithCommaSeparator(
                    extractCommanderLevel(playerData.data.profileChanges)
                      .total
                  )}
                />
                <div className="pt-2">
                  <AccountBasicInformationSection
                    title={t('information.first-claim')}
                    value={firstDate}
                  />
                  <AccountBasicInformationSection
                    title={t('information.last-played')}
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
