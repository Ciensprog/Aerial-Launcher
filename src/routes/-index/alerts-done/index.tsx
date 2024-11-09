import { EmptyResults } from '../-components/-empty'
import { MissionItem, MissionsContainer } from '../-components/-missions'

import { imgModifiers, imgResources } from '../../../lib/repository'

import { vbucksMissions } from '../-dummy-data'

export function AlertsDone() {
  return (
    <>
      <div className="mt-5 space-y-4">
        <section className="">
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
      </div>

      <EmptyResults title="No alerts done" />
    </>
  )
}
