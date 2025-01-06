import { useTranslation } from 'react-i18next'

import {
  defaultMissionInterval,
  missionIntervalRange,
} from '../../../config/constants/automation'
import {
  claimingRewardsDelayRange,
  defaultClaimingRewardsDelay,
} from '../../../config/constants/mcp'

import { Button } from '../../../components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { Switch } from '../../../components/ui/switch'

import { useSetupForm } from '../-hooks'

export function AppSettingsBaseForm() {
  const { t } = useTranslation(['settings', 'general'])

  const { form, onSubmit } = useSetupForm()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full"
      >
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('app-settings.form.path.label')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userAgent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('app-settings.form.user-agent.label')}{' '}
                  <span className="block text-muted-foreground text-xs">
                    {t('app-settings.form.user-agent.note')}
                  </span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="claimingRewards"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('app-settings.form.claiming-rewards.label')}{' '}
                  <span className="block text-muted-foreground text-xs">
                    {t('app-settings.form.claiming-rewards.note', {
                      min: claimingRewardsDelayRange.min,
                      max: claimingRewardsDelayRange.max,
                      default: defaultClaimingRewardsDelay,
                    })}
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t(
                      'app-settings.form.claiming-rewards.input.placeholder'
                    )}
                    onChange={(event) => {
                      const newValue = event.target.value.replace(
                        /[^0-9.]+/gi,
                        ''
                      )

                      form.setValue('claimingRewards', newValue)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="missionInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('app-settings.form.mission-interval.label')}
                  <span className="block mb-2 text-muted-foreground text-xs">
                    {t('app-settings.form.mission-interval.note1', {
                      value:
                        form.getValues('missionInterval') === ''
                          ? 3
                          : form.getValues('missionInterval'),
                    })}
                  </span>
                  <span className="block text-muted-foreground text-xs">
                    {t('app-settings.form.mission-interval.note2', {
                      min: missionIntervalRange.min,
                      max: missionIntervalRange.max,
                      default: defaultMissionInterval,
                    })}
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t(
                      'app-settings.form.mission-interval.input.placeholder'
                    )}
                    onChange={(event) => {
                      const newValue = event.target.value.replace(
                        /[^0-9]+/gi,
                        ''
                      )

                      form.setValue('missionInterval', newValue)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="systemTray"
            render={({ field }) => (
              <FormItem className="flex items-center space-y-0">
                <FormLabel>{t('app-settings.form.tray.label')}</FormLabel>
                <FormControl className="ml-auto">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="mt-4 w-full"
        >
          {t('update-information', {
            ns: 'general',
          })}
        </Button>
      </form>
    </Form>
  )
}
