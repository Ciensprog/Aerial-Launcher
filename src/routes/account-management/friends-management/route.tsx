import { createRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import { Combobox } from '../../../components/ui/extended/combobox'
// import { Label } from '../../../components/ui/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import { GoToTop } from '../../../components/go-to-top'

import { FriendsSection } from './-sections/-friends'
import { IncomingSection } from './-sections/-incoming'
import { OutgoingSection } from './-sections/-outgoing'
import { BlocklistSection } from './-sections/-blocklist'

import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { useAccountSelector, useFriendsActions } from './-hooks'

import { cn } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/friends-management',
  component: () => {
    const { t } = useTranslation(['sidebar'], {
      keyPrefix: 'account-management',
    })

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t('options.friends-management')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['account-management', 'general'])

  const {
    accountSelectorIsDisabled,
    currentSelection,
    data,
    options,
    selected,
    customFilter,
    onChangeSelections,
    onSelectItem,
  } = useAccountSelector()
  const { isLoading, getFriendsSummary } = useFriendsActions()
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  return (
    <>
      <div className="flex flex-grow">
        <div className="flex flex-col gap-5 items-center mb-14 w-full">
          <div className="max-w-lg space-y-2 w-full">
            <div className="flex flex-grow gap-5">
              <Combobox
                className="max-w-full"
                emptyPlaceholder={t('form.accounts.no-options', {
                  ns: 'general',
                })}
                emptyContent={t('form.accounts.search-empty', {
                  ns: 'general',
                })}
                placeholder={t('form.accounts.select', {
                  ns: 'general',
                })}
                placeholderSearch={t('form.accounts.placeholder', {
                  ns: 'general',
                  context: !getMenuOptionVisibility('showTotalAccounts')
                    ? 'private'
                    : undefined,
                  total: options.length,
                })}
                options={options}
                value={currentSelection}
                customFilter={customFilter}
                onChange={onChangeSelections}
                onSelectItem={onSelectItem}
                emptyContentClassname="py-6 text-center text-sm"
                disabled={accountSelectorIsDisabled}
                disabledItem={accountSelectorIsDisabled}
                inputSearchIsDisabled={accountSelectorIsDisabled}
                hideInputSearchWhenOnlyOneOptionIsAvailable
                hideSelectorOnSelectItem
              />
              <Button
                size="sm"
                variant="default"
                onClick={getFriendsSummary}
                disabled={!selected || isLoading}
              >
                Get Friends List
              </Button>
            </div>
          </div>

          <div className="max-w-lg w-full">
            <Tabs
              className={cn('max-w-lg', '[&_.tab-content]:mt-6')}
              defaultValue={'friends'}
            >
              <div className="flex items-center">
                <TabsList id="friends-navigation-tab">
                  <TabsTrigger value={'friends'}>Friends</TabsTrigger>
                  <TabsTrigger value={'incoming'}>Incoming</TabsTrigger>
                  <TabsTrigger value={'outgoing'}>Outgoing</TabsTrigger>
                  <TabsTrigger value={'blocklist'}>Blocklist</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent
                className="tab-content"
                value={'friends'}
              >
                <FriendsSection data={data.friends} />
              </TabsContent>
              <TabsContent
                className="tab-content"
                value={'incoming'}
              >
                <IncomingSection data={data.incoming} />
              </TabsContent>
              <TabsContent
                className="tab-content"
                value={'outgoing'}
              >
                <OutgoingSection data={data.outgoing} />
              </TabsContent>
              <TabsContent
                className="tab-content"
                value={'blocklist'}
              >
                <BlocklistSection data={data.blocklist} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <GoToTop containerId="friends-navigation-tab" />
    </>
  )
}
