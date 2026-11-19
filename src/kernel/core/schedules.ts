import { CronJob } from 'cron'

/**
 * Schedules
 */
export class Schedules {
  private static readonly jobs: Array<CronJob> = []

  static add({
    cronTime,
    onTick,
  }: {
    cronTime: string
    onTick: () => unknown
  }) {
    Schedules.jobs.push(
      CronJob.from({
        cronTime,
        onTick: () => {
          onTick()
        },
        start: true,
        timeZone: 'UTC',
      }),
    )
  }

  static stopAll() {
    for (const job of Schedules.jobs.splice(0)) {
      job.stop()
    }
  }
}
