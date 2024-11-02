import { createRoute } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'

import {
  defaultMissionInterval,
  missionIntervalRange,
} from '../../config/constants/automation'
import {
  claimingRewardsDelayRange,
  defaultClaimingRewardsDelay,
} from '../../config/constants/mcp'

import { Route as RootRoute } from '../__root'

import { HomeBreadcrumb } from '../../components/navigations/breadcrumb/home'
import { SeparatorWithTitle } from '../../components/ui/extended/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { Switch } from '../../components/ui/switch'

import { AccountCustomization } from './-account-customization/-index'
import { TagsManagement } from './-tags-management/-index'

import { useGetAccounts } from '../../hooks/accounts'
import { useSetupForm } from './-hooks'

import { cn } from '../../lib/utils'

enum SettingsSections {
  AppSettings = 'app-settings',
  TagsManagement = 'tags-management',
  AccountCustomization = 'account-customization',
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/settings',
  component: () => {
    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { accountsArray } = useGetAccounts()
  const { form, onSubmit } = useSetupForm()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center- justify-center w-full">
        <div className="flex flex-col max-w-lg w-full">
          <Accordion
            className={cn(
              'space-y-2- w-full',
              '[&_.section-trigger[data-state=open]_.section-icon]:rotate-180',
              '[&_.section-title]:flex [&_.section-title]:gap-1.5 [&_.section-title]:items-center',
              '[&_.section-icon]:h-4 [&_.section-icon]:w-4 [&_.section-icon]:shrink-0 [&_.section-icon]:transition-transform [&_.section-icon]:duration-200',
              '[&_.section-content]:py-6'
            )}
            type="multiple"
            defaultValue={[SettingsSections.AccountCustomization]}
          >
            <AccordionItem
              className="border-none"
              value={SettingsSections.AppSettings}
            >
              <AccordionTrigger
                className="section-trigger"
                hideIcon
              >
                <SeparatorWithTitle className="section-title">
                  App Settings <ChevronDown className="section-icon" />
                </SeparatorWithTitle>
              </AccordionTrigger>
              <AccordionContent className="section-content">
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
                                  Only is applied if you don't have
                                  Fortnite installed.
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
                                  {claimingRewardsDelayRange.max}. Default
                                  is: {defaultClaimingRewardsDelay}.
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Examples: 0, 1, 1.5, 3, 4, 4.2 or 5"
                                  onChange={(event) => {
                                    const newValue =
                                      event.target.value.replace(
                                        /[^0-9.]+/gi,
                                        ''
                                      )

                                    form.setValue(
                                      'claimingRewards',
                                      newValue
                                    )
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
                                Custom Interval Time For Checking Current
                                Mission
                                <span className="block mb-2 text-muted-foreground text-xs">
                                  Means every{' '}
                                  {form.getValues('missionInterval') === ''
                                    ? 3
                                    : form.getValues(
                                        'missionInterval'
                                      )}{' '}
                                  second
                                  {form.getValues('missionInterval') ===
                                  '1'
                                    ? ''
                                    : 's'}{' '}
                                  is checking if you are on a mission. This
                                  is used with automation feature.
                                </span>
                                <span className="block text-muted-foreground text-xs">
                                  Value in seconds between{' '}
                                  {missionIntervalRange.min} and{' '}
                                  {missionIntervalRange.max}. Default is:{' '}
                                  {defaultMissionInterval}.
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Examples: 1, 3, 4 or 5"
                                  onChange={(event) => {
                                    const newValue =
                                      event.target.value.replace(
                                        /[^0-9]+/gi,
                                        ''
                                      )

                                    form.setValue(
                                      'missionInterval',
                                      newValue
                                    )
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              className="border-none"
              value={SettingsSections.TagsManagement}
            >
              <AccordionTrigger
                className="section-trigger"
                hideIcon
              >
                <SeparatorWithTitle className="section-title">
                  Tags Management <ChevronDown className="section-icon" />
                </SeparatorWithTitle>
              </AccordionTrigger>
              <AccordionContent className="section-content">
                <TagsManagement />
              </AccordionContent>
            </AccordionItem>

            {accountsArray.length > 0 && (
              <AccordionItem
                className="border-none"
                value={SettingsSections.AccountCustomization}
              >
                <AccordionTrigger
                  className="section-trigger"
                  hideIcon
                >
                  <SeparatorWithTitle className="section-title">
                    Account Customization{' '}
                    <ChevronDown className="section-icon" />
                  </SeparatorWithTitle>
                </AccordionTrigger>
                <AccordionContent className="section-content">
                  <AccountCustomization />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
