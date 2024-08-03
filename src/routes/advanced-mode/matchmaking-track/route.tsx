import type { MouseEventHandler } from 'react'

import { UpdateIcon } from '@radix-ui/react-icons'
import { Link, createRoute } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'

import { fortniteDBProfileURL } from '../../../config/fortnite/links'

import { Route as RootRoute } from '../../__root'

import { SearchedUserData } from '../../stw-operations/xpboosts/route'

import { Combobox } from '../../../components/ui/extended/combobox'
import { SeparatorWithTitle } from '../../../components/ui/extended/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
import { useCurrentActions } from './-hooks'

import { extractXPBoosts } from '../../../lib/parsers/query-profile'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/advanced-mode/matchmaking-track',
  component: () => {
    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Advanced Mode</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Matchmaking Track</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Content />
      </>
    )
  },
})

function Content() {
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

  const userBoosts = extractXPBoosts(
    searchedUser?.success && searchedUser?.data
      ? searchedUser.data.profileChanges
      : undefined
  )

  const handleOpenExternalFNDBProfileUrl =
    (displayName: string): MouseEventHandler<HTMLAnchorElement> =>
    (event) => {
      event.preventDefault()

      window.electronAPI.openExternalURL(fortniteDBProfileURL(displayName))
    }

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center mb-10 w-full">
        <div className="flex flex-col gap-5 max-w-lg w-full">
          <Card>
            <CardHeader className="border-b">
              <CardDescription>
                Check if this is the user you are looking for and request
                for their matchmaking information.
              </CardDescription>
              {path && (
                <CardDescription>
                  Default path file:
                  <span className="block">{path}</span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-6 px-0 space-y-4">
              <div className="grid gap-4 px-6">
                <div className="">
                  <Label
                    className="text-muted-foreground text-sm"
                    htmlFor="global-input-recently-players"
                  >
                    Note: This players are stored temporarily
                  </Label>
                  <Combobox
                    className="max-w-full"
                    emptyPlaceholder="No recently players"
                    placeholder="Select a recently player"
                    placeholderSearch="Search on 1 players"
                    options={options}
                    value={[]}
                    customFilter={customFilter}
                    onChange={() => {}}
                    onSelectItem={autoCompletePlayer}
                    emptyContentClassname="p-1"
                    disabled={searchUserIsSubmitting}
                    disabledItem={searchUserIsSubmitting}
                    inputSearchIsDisabled={searchUserIsSubmitting}
                    hideSelectorOnSelectItem
                  />
                </div>
                <SeparatorWithTitle>Or</SeparatorWithTitle>
                <Label htmlFor="global-input-search-player">
                  Search player by accountId or display name (epic, xbl or
                  psn)
                </Label>
                <div className="flex items-center relative">
                  <Input
                    placeholder="Example: Sample"
                    className="pr-32 pl-3 py-1"
                    value={inputSearchDisplayName}
                    onChange={handleChangeSearchDisplayName}
                    disabled={searchUserIsSubmitting}
                    id="global-input-search-player"
                  />
                  <Button
                    className="absolute h-8 px-2 py-1.5 right-1 text-sm w-28"
                    onClick={handleSearchUser}
                    disabled={inputSearchButtonIsDisabled}
                  >
                    {searchUserIsSubmitting ? (
                      <UpdateIcon className="animate-spin h-4" />
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>

                {searchedUser &&
                  !searchedUser.success &&
                  !searchedUser.isPrivate && (
                    <div className="mt-2 text-center text-muted-foreground">
                      {searchedUser.errorMessage
                        ? searchedUser.errorMessage
                        : 'No player found'}
                    </div>
                  )}
              </div>
              {searchedUser?.data && (
                <div className="px-6">
                  <div className="">
                    <div className="">
                      <a
                        href={fortniteDBProfileURL(
                          searchedUser.data.lookup.displayName
                        )}
                        className="inline-flex gap-2 items-center hover:opacity-75"
                        onClick={handleOpenExternalFNDBProfileUrl(
                          searchedUser.data.lookup.displayName
                        )}
                      >
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
                      {searchedUser?.isPrivate ? (
                        <>
                          <div className="py-1.5">
                            <div className="">Note:</div>
                            This user has "Public Game Stats" disabled,
                            more information can't be displayed.
                          </div>
                        </>
                      ) : (
                        searchedUser?.success && (
                          <SearchedUserData
                            boostedXP={searchedUser.data.profileChanges}
                            collectionBookLevel={
                              searchedUser.data.profileChanges.profile
                                .stats.attributes.collection_book
                                ?.maxBookXpLevelAchieved ?? 0
                            }
                            commanderLevel={
                              searchedUser.data.profileChanges.profile
                                .stats.attributes.level +
                              (searchedUser.data.profileChanges.profile
                                .stats.attributes
                                .rewards_claimed_post_max_level ?? 0)
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
                      className="w-48"
                      onClick={handleSave(searchedUser.data.lookup.id)}
                      disabled={searchUserIsSubmitting}
                    >
                      {isLoading ? (
                        <UpdateIcon className="animate-spin h-4" />
                      ) : (
                        'Create Matchmaking File'
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
