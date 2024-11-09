import { MissionItem, MissionsContainer } from '../-components/-missions'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { imgModifiers, imgResources } from '../../../lib/repository'
import { cn } from '../../../lib/utils'

import { missions160s, vbucksMissions } from '../-dummy-data'

export function HomeAlerts() {
  return (
    <>
      <div className="flex gap-2">
        <PreviewItem
          imageUrl={imgResources('currency_mtxswap.png')}
          quantity={123456}
          title="Total V-Bucks"
        />
        <PreviewItem
          imageUrl={imgResources('voucher_generic_worker_sr.png')}
          quantity={123456}
          title="Survivors"
        />
        <PreviewItem
          imageUrl={imgResources('voucher_cardpack_bronze.png')}
          quantity={123456}
          title="Upgrade Llamas"
        />
        <PreviewItem
          imageUrl={imgResources('reagent_alteration_upgrade_uc.png')}
          quantity={123456}
          title="Uncommon PERK-UP!"
        />
      </div>

      <div className="my-5 space-y-4">
        <section className="">
          <h2 className="font-bold mb-2 text-lg">V-Bucks Alerts</h2>
          <MissionsContainer>
            {vbucksMissions.map((data) => (
              <MissionItem
                data={data}
                key={data.id}
              >
                <>
                  <img
                    src={imgResources('currency_mtxswap.png')}
                    className="img-type"
                    alt="V-Bucks"
                  />
                  35 一
                  <span className="">
                    <img
                      src={imgModifiers('negative-mini-boss.png')}
                      className="img-modifier"
                      alt="Modifier"
                    />
                  </span>
                </>
              </MissionItem>
            ))}
          </MissionsContainer>
        </section>

        <section className="">
          <h2 className="font-bold mb-2 text-lg">Missions 160</h2>
          <MissionsContainer>
            {missions160s.map((data) => (
              <MissionItem
                data={data}
                key={data.id}
              >
                <>
                  {data.rewards.base.map((reward) => (
                    <span
                      className={cn('flex items-center rounded', {
                        'gap mx-0.5 px-1 py-0.5 outline outline-[#ff6868]/50 outline-2':
                          reward.isBad,
                      })}
                      key={reward.id}
                    >
                      <img
                        src={imgResources(`${reward.id}.png`)}
                        className="img-type"
                        alt="Resource"
                        key={reward.id}
                      />
                      {reward.quantity <= 1 ? (
                        ''
                      ) : (
                        <span className="ml-0.5 text-sm">
                          {numberWithCommaSeparator(reward.quantity)}x
                        </span>
                      )}
                      {reward.isBad && (
                        <span className="font-medium ml-1 px-1 rounded text-[#ff6868] text-[0.625rem] uppercase">
                          Bad
                        </span>
                      )}
                    </span>
                  ))}
                  一
                  <span className="flex gap-1">
                    {data.modifiers.map((modifier) => (
                      <img
                        src={imgModifiers(`${modifier.id}.png`)}
                        className="img-modifier"
                        alt="Modifier"
                        key={modifier.id}
                      />
                    ))}
                  </span>
                </>
              </MissionItem>
            ))}
          </MissionsContainer>
        </section>
      </div>
    </>
  )
}

function PreviewItem({
  imageUrl,
  title,
  quantity,
}: {
  imageUrl: string
  title: string
  quantity: number
}) {
  return (
    <div className="border rounded max-w-32 w-full">
      <figure className="bg-muted-foreground/5 flex flex-col items-center py-2">
        <img
          src={imageUrl}
          className="size-10"
          alt={title}
        />
      </figure>
      <div className="break-all font-bold px-2 py-1 text-center text-lg w-full">
        {numberWithCommaSeparator(quantity)}
      </div>
    </div>
  )
}
