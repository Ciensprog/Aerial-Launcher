import {
  defaultMissionInterval,
  missionIntervalRange,
} from '../../../config/constants/automation'
import {
  claimingRewardsDelayRange,
  defaultClaimingRewardsDelay,
} from '../../../config/constants/mcp'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../../components/ui/card'
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
  const { form, onSubmit } = useSetupForm()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full"
      >
        <Card className="w-full">
          <CardContent className="grid gap-4 pt-6">
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Path</FormLabel>
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
                    Custom User Agent{' '}
                    <span className="block text-muted-foreground text-xs">
                      Only is applied if you don't have Fortnite installed.
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
                    Custom Delay For Claiming Rewards{' '}
                    <span className="block text-muted-foreground text-xs">
                      Value in seconds between{' '}
                      {claimingRewardsDelayRange.min} and{' '}
                      {claimingRewardsDelayRange.max}. Default is:{' '}
                      {defaultClaimingRewardsDelay}.
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Examples: 0, 1, 1.5, 3, 4, 4.2 or 5"
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
                    Custom Interval Time For Checking Current Mission
                    <span className="block mb-2 text-muted-foreground text-xs">
                      Means every{' '}
                      {form.getValues('missionInterval') === ''
                        ? 3
                        : form.getValues('missionInterval')}{' '}
                      second
                      {form.getValues('missionInterval') === '1'
                        ? ''
                        : 's'}{' '}
                      is checking if you are on a mission. This is used
                      with automation feature.
                    </span>
                    <span className="block text-muted-foreground text-xs">
                      Value in seconds between {missionIntervalRange.min}{' '}
                      and {missionIntervalRange.max}. Default is:{' '}
                      {defaultMissionInterval}.
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Examples: 1, 3, 4 or 5"
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
                  <FormLabel>Hide to system tray</FormLabel>
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
          </CardContent>
          <CardFooter className="space-x-6">
            <Button
              type="submit"
              className="w-full"
            >
              Update Information
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
