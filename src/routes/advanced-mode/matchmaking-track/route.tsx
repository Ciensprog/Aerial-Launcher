import type { MouseEventHandler } from 'react'

import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { fortniteDBProfileURL } from '../../../config/fortnite/links'

import { Route as RootRoute } from '../../__root'

import {
  AccountBasicInformationSection,
  ExternalAuthTypeImage,
  SearchedUserData,
} from '../../stw-operations/xpboosts/route'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { Combobox } from '../../../components/ui/extended/combobox'
import { SeparatorWithTitle } from '../../../components/ui/extended/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'

import { useSearchUser } from '../../stw-operations/xpboosts/-hooks'

import {
  useMatchmakingPath,
  useMatchmakingPlayersPath,
} from '../../../hooks/advanced-mode/matchmaking'
import { useInputPaddingButton } from '../../../hooks/ui/inputs'
import { useCurrentActions } from './-hooks'

import {
  extractCommanderLevel,
  extractXPBoosts,
} from '../../../lib/parsers/query-profile'
import { whatIsThis } from '../../../lib/callbacks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/advanced-mode/matchmaking-track',
  component: () => {
    const { t } = useTranslation(['sidebar'])

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('advanced-mode.title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t('advanced-mode.options.matchmaking-track')}
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
  const { t } = useTranslation(['advanced-mode', 'general'])

  const { updateRecentlyPlayers } = useMatchmakingPlayersPath()
  const {
    inputSearchButtonIsDisabled,
    inputSearchDisplayName,
    searchUserIsSubmitting,
    searchedUser,

    handleChangeSearchDisplayName,
    handleManualChangeSearchDisplayName,
    handleSearchUser,
  } = useSearchUser({
    callback: (value) => {
      if (value.data?.lookup) {
        updateRecentlyPlayers(value.data.lookup)
      }
    },
  })
  const { path } = useMatchmakingPath()
  const {
    isLoading,
    options,
    autoCompletePlayer,
    customFilter,
    handleSave,
  } = useCurrentActions({
    searchedUser,
    handleManualChangeSearchDisplayName,
  })

  const [$updateInput, $updateButton] = useInputPaddingButton()

  const userBoosts = extractXPBoosts(
    searchedUser?.success && searchedUser?.data
      ? searchedUser.data.profileChanges
      : undefined
  )

  const handleOpenExternalFNDBProfileUrl =
    (accountId: string): MouseEventHandler<HTMLAnchorElement> =>
    (event) => {
      event.preventDefault()

      window.electronAPI.openExternalURL(fortniteDBProfileURL(accountId))
    }

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col gap-5 max-w-lg w-full">
          <Card>
            <CardHeader className="border-b">
              <CardDescription>
                {t('matchmaking-track.description')}
              </CardDescription>
              {path && (
                <CardDescription className="border-l-4 pl-2 space-y-1">
                  <span>{t('matchmaking-track.note')}</span>
                  <span className="bg-muted/20 block px-2 py-1 rounded">
                    {path}
                  </span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-6 px-0 space-y-4">
              <div className="grid gap-4 px-6">
                <div className="space-y-2">
                  <Label
                    className="text-muted-foreground text-sm"
                    htmlFor="global-input-recently-players"
                  >
                    {t('matchmaking-track.form.recently.label')}
                  </Label>
                  <Combobox
                    className="max-w-full"
                    emptyPlaceholder={t(
                      'form.player.recently.empty-placeholder',
                      {
                        ns: 'general',
                      }
                    )}
                    emptyContent={t('form.player.search-empty')}
                    placeholder={t(
                      'form.player.recently.select-placeholder',
                      {
                        ns: 'general',
                      }
                    )}
                    placeholderSearch={t(
                      'form.player.recently.search-placeholder',
                      {
                        ns: 'general',
                        total: options.length,
                      }
                    )}
                    options={options}
                    value={[]}
                    customFilter={customFilter}
                    onChange={() => {}}
                    onSelectItem={autoCompletePlayer}
                    emptyContentClassname="py-6 text-center text-sm"
                    disabled={searchUserIsSubmitting}
                    disabledItem={searchUserIsSubmitting}
                    inputSearchIsDisabled={searchUserIsSubmitting}
                    hideSelectorOnSelectItem
                  />
                </div>

                <SeparatorWithTitle>
                  {t('separators.or', {
                    ns: 'general',
                  })}
                </SeparatorWithTitle>

                <form
                  className="space-y-2"
                  onSubmit={(event) => {
                    event.preventDefault()

                    if (!inputSearchButtonIsDisabled) {
                      handleSearchUser()
                    }
                  }}
                >
                  <Label htmlFor="global-input-search-player">
                    {t('form.search-account.label', {
                      ns: 'general',
                    })}
                  </Label>
                  <div className="flex items-center relative">
                    <Input
                      placeholder={t(
                        'form.search-account.input.placeholder',
                        {
                          ns: 'general',
                        }
                      )}
                      className="pr-[var(--pr-button-width)] pl-3 py-1"
                      value={inputSearchDisplayName}
                      onChange={handleChangeSearchDisplayName}
                      disabled={searchUserIsSubmitting}
                      id="global-input-search-player"
                      ref={$updateInput}
                    />
                    <Button
                      type="submit"
                      className="absolute h-8 px-2 py-1.5 right-1 text-sm w-28"
                      disabled={inputSearchButtonIsDisabled}
                      ref={$updateButton}
                    >
                      {searchUserIsSubmitting ? (
                        <UpdateIcon className="animate-spin h-4" />
                      ) : (
                        t('actions.search', {
                          ns: 'general',
                        })
                      )}
                    </Button>
                  </div>
                </form>

                {searchedUser &&
                  !searchedUser.success &&
                  !searchedUser.isPrivate && (
                    <div className="mt-2 text-center text-muted-foreground">
                      {searchedUser.errorMessage
                        ? searchedUser.errorMessage
                        : t('form.player.search-empty', {
                            ns: 'general',
                          })}
                    </div>
                  )}
              </div>

              {searchedUser && searchedUser.data && (
                <div className="px-6">
                  <div>
                    <div>
                      <a
                        href={fortniteDBProfileURL(
                          searchedUser.data.lookup.id
                        )}
                        className="inline-flex gap-2 items-center hover:opacity-75"
                        onClick={handleOpenExternalFNDBProfileUrl(
                          searchedUser.data.lookup.id
                        )}
                        onAuxClick={whatIsThis()}
                      >
                        <ExternalAuthTypeImage
                          externalAuthType={
                            searchedUser.data.lookup.externalAuthType
                          }
                        />
                        <span className="max-w-72 text-lg truncate">
                          {searchedUser.data.lookup.displayName}
                        </span>
                        <ExternalLink
                          className="stroke-muted-foreground"
                          size={16}
                        />
                      </a>
                    </div>
                    <div className="border-l-4 pl-3 space-y-0.5 text-muted-foreground text-sm [&_.icon-wrapper]:flex [&_.icon-wrapper]:items-center [&_.icon-wrapper]:justify-center [&_.icon-wrapper]:size-5">
                      {searchedUser.isPrivate ? (
                        <>
                          <AccountBasicInformationSection
                            title={t('information.account-id', {
                              ns: 'general',
                            })}
                            value={searchedUser.data.lookup.id}
                          />
                          <div className="py-1.5">
                            <div>
                              {t('matchmaking-track.results.notes')}
                            </div>
                            <ul className="list-disc pl-5">
                              <li>
                                {t(
                                  'matchmaking-track.results.options.public-stats'
                                )}
                              </li>
                              <li className="italic">
                                {t(
                                  'matchmaking-track.results.options.continuation'
                                )}
                              </li>
                            </ul>
                          </div>
                        </>
                      ) : (
                        searchedUser.success && (
                          <SearchedUserData
                            accountId={searchedUser.data.lookup.id}
                            boostedXP={searchedUser.data.profileChanges}
                            collectionBookLevel={
                              searchedUser.data.profileChanges.profile
                                .stats.attributes.collection_book
                                ?.maxBookXpLevelAchieved ?? 0
                            }
                            commanderLevel={
                              extractCommanderLevel(
                                searchedUser.data.profileChanges
                              ).total
                            }
                            daysLoggedIn={
                              searchedUser.data.profileChanges.profile
                                .stats.attributes.daily_rewards
                                ?.totalDaysLoggedIn ?? 0
                            }
                            founderStatus={
                              searchedUser.data.profileChanges
                            }
                            personalXPBoosts={userBoosts.personal}
                            teammateXPBoosts={userBoosts.teammate}
                            hideXPBoostsData
                          />
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-5 text-center">
                    <Button
                      className="px-1 w-48"
                      onClick={handleSave(searchedUser.data.lookup.id)}
                      disabled={searchUserIsSubmitting}
                    >
                      {isLoading ? (
                        <UpdateIcon className="animate-spin h-4" />
                      ) : (
                        <span className="leading-4 text-balance truncate">
                          {t('matchmaking-track.form.submit-button')}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
