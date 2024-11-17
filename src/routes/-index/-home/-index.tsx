import { LoadingMissions } from '../-components/-loading'
import { EndgameTwinePeaksSection } from './endgame-twine-peaks'
import { EndgameVenturesSection } from './endgame-ventures'
import { SurvivorsSection } from './survivors'
import { UncommonPerkUpSection } from './uncommon-perk-up'
import { UpgradeLlamaTokensSection } from './upgrade-llama-tokens'
import { VBucksSection } from './vbucks'

import { useAlertItemCounter } from '../-hooks'
import { useHomeData } from './-hooks'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { isLegendaryOrMythicSurvivor } from '../../../lib/validations/resources'
import { imgResources } from '../../../lib/repository'

export function HomeAlerts() {
  const {
    endgame,
    loading,
    survivors,
    uncommonPerks,
    upgradeLlamas,
    vbucks,
  } = useHomeData()
  const vbucksTotal = useAlertItemCounter({
    data: vbucks,
    key: 'currency_mtxswap',
  })
  const survivorsTotal = useAlertItemCounter({
    data: survivors,
    validationFn: isLegendaryOrMythicSurvivor,
  })
  const upgradeLlamasTotal = useAlertItemCounter({
    data: upgradeLlamas,
    key: 'voucher_cardpack_bronze',
  })
  const uncommonPerksTotal = useAlertItemCounter({
    data: uncommonPerks,
    key: 'alteration_upgrade_uc',
  })

  return (
    <>
      <ul className="gap-2 grid grid-cols-4">
        <PreviewItem
          imageUrl={imgResources('currency_mtxswap.png')}
          quantity={vbucksTotal}
          title="Total V-Bucks"
        />
        <PreviewItem
          imageUrl={imgResources('voucher_generic_worker_sr.png')}
          quantity={survivorsTotal}
          title="Survivors"
        />
        <PreviewItem
          imageUrl={imgResources('voucher_cardpack_bronze.png')}
          quantity={upgradeLlamasTotal}
          title="Upgrade Llamas"
        />
        <PreviewItem
          imageUrl={imgResources('reagent_alteration_upgrade_uc.png')}
          quantity={uncommonPerksTotal}
          title="Uncommon PERK-UP!"
        />
      </ul>

      <div className="space-y-1">
        {loading.isFetching ? (
          <div className="mt-6 space-y-6">
            <LoadingMissions
              total={2}
              section
              showTitle
            />
            <LoadingMissions
              total={2}
              section
              showTitle
            />
          </div>
        ) : (
          <>
            <VBucksSection data={vbucks} />
            <SurvivorsSection data={survivors} />
            <EndgameTwinePeaksSection data={endgame.twinePeaks} />
            <EndgameVenturesSection data={endgame.ventures} />
            <UpgradeLlamaTokensSection data={upgradeLlamas} />
            <UncommonPerkUpSection data={uncommonPerks} />
          </>
        )}
      </div>
    </>
  )
}

function PreviewItem({
  imageUrl,
  quantity,
}: {
  imageUrl: string
  title: string
  quantity: number
}) {
  return (
    <li className="border flex items-center rounded">
      <div className="bg-muted-foreground/10 flex flex-shrink-0 h-10 items-center justify-center w-11">
        <img
          src={imageUrl}
          className="size-7"
        />
      </div>
      <div className="flex-grow font-medium px-2 text-center truncate">
        {numberWithCommaSeparator(quantity)}
      </div>
    </li>
  )
}
