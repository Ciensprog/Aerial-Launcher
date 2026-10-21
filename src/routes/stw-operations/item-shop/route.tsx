import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { ShoppingBag } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { AccountSelectors } from '../../../components/selectors/accounts'
import { GoToTop } from '../../../components/go-to-top'
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
  CardTitle,
} from '../../../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'

import { useItemShopPage } from './-hooks'
import { OfferGrid } from './-offer-grid'
import { GiftReceiverInfo } from './-receiver-info'

import { relativeTime } from '../../../lib/dates'
import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/item-shop',
  component: () => {
    const { t } = useTranslation(['sidebar'])

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('stw-operations.title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t('stw-operations.options.item-shop')}
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
  const { t } = useTranslation(['stw-operations', 'general'])
  const {
    accountInfo,
    accountOptions,
    buyOffer,
    catalog,
    creatorCode,
    giftLookup,
    giftOffer,
    giftSearch,
    isActing,
    isBusy,
    isDisabledForm,
    isLoadingCatalog,
    isSearchingGift,
    offers,
    parsedSelectedAccounts,
    parsedSelectedTags,
    search,
    section,
    selectedAccountData,
    tagOptions,

    handleApplyCreatorCode,
    handleBuy,
    handleChangeGiftSearch,
    handleGift,
    handleLoad,
    handleSearchGift,
    setBuyOffer,
    setCreatorCode,
    setGiftOffer,
    setSearch,
    setSection,
    updateAccounts,
    updateTags,
  } = useItemShopPage()

  return (
    <>
      <div className="flex flex-grow">
        <div className="flex flex-col gap-4 w-full px-2 pb-6">
          <Card className="w-full shadow-sm">
            <CardHeader className="border-b space-y-2 py-4">
              <CardTitle className="flex gap-2 items-center text-lg">
                <span className="bg-primary/10 flex p-1.5 rounded-md">
                  <ShoppingBag className="size-5 text-primary" />
                </span>
                {t('item-shop.title')}
              </CardTitle>
              <CardDescription>
                {t('item-shop.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-4">
              <AccountSelectors
                accounts={{
                  options: accountOptions,
                  value: parsedSelectedAccounts,
                }}
                tags={{
                  options: tagOptions,
                  value: parsedSelectedTags,
                }}
                onUpdateAccounts={updateAccounts}
                onUpdateTags={updateTags}
              />
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  id="item-shop-load-button"
                  size="sm"
                  onClick={handleLoad}
                  disabled={isDisabledForm || isLoadingCatalog}
                >
                  {isLoadingCatalog ? (
                    <UpdateIcon className="animate-spin" />
                  ) : (
                    t('item-shop.load')
                  )}
                </Button>
                {catalog.shopDate && (
                  <span className="text-muted-foreground text-xs">
                    {t('item-shop.shop-date', {
                      date: catalog.shopDate,
                    })}
                    {catalog.fromCache
                      ? ` · ${t('item-shop.from-cache')}`
                      : ''}
                  </span>
                )}
                {catalog.expiration && (
                  <span className="text-muted-foreground text-xs">
                    {t('item-shop.expiration', {
                      time: relativeTime(catalog.expiration),
                    })}
                  </span>
                )}
              </div>
              {catalog.newShopAvailable && (
                <div className="border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 rounded text-amber-200 text-xs">
                  {t('item-shop.new-shop-available')}
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">
                    {t('item-shop.creator.label')}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={creatorCode}
                      onChange={(event) =>
                        setCreatorCode(event.target.value)
                      }
                      placeholder={t('item-shop.creator.placeholder')}
                      disabled={isActing}
                    />
                    <Button
                      size="sm"
                      className="flex-shrink-0"
                      onClick={handleApplyCreatorCode}
                      disabled={
                        isDisabledForm ||
                        isActing ||
                        creatorCode.trim() === ''
                      }
                    >
                      {t('item-shop.creator.apply')}
                    </Button>
                  </div>
                </div>
              </div>
              {selectedAccountData.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground text-xs">
                  {selectedAccountData.map((account) => {
                    const info = accountInfo[account.accountId]

                    return (
                      <span key={account.accountId}>
                        {t('item-shop.owned-vbucks', {
                          name: parseCustomDisplayName(account),
                          amount: numberWithCommaSeparator(
                            info?.vbucks ?? 0
                          ),
                        })}
                        {info?.affiliate
                          ? ` · ${info.affiliate}`
                          : ''}
                      </span>
                    )
                  })}
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('item-shop.search')}
                />
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('item-shop.section-all')}
                    </SelectItem>
                    {catalog.sections.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {catalog.offers.length <= 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              {t('item-shop.empty')}
            </div>
          ) : offers.length <= 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              {t('item-shop.empty-filter')}
            </div>
          ) : (
            <OfferGrid
              offers={offers}
              disabled={isBusy}
              catalogExpiration={catalog.expiration}
              onBuy={setBuyOffer}
              onGift={setGiftOffer}
            />
          )}
        </div>
      </div>
      <GoToTop containerId="item-shop-load-button" />

      <Dialog
        open={buyOffer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBuyOffer(null)
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t('item-shop.confirm-buy', {
                name: buyOffer?.title ?? '',
              })}
            </DialogTitle>
          </DialogHeader>
          {buyOffer && (
            <div className="text-sm text-muted-foreground">
              {t('item-shop.price', {
                price: numberWithCommaSeparator(buyOffer.price),
              })}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={handleBuy}
              disabled={isActing || !buyOffer}
            >
              {isActing ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                t('item-shop.buy')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={giftOffer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setGiftOffer(null)
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('item-shop.confirm-gift', {
                name: giftOffer?.title ?? '',
              })}
            </DialogTitle>
          </DialogHeader>
          {giftOffer && !giftOffer.giftable ? (
            <div className="text-sm text-muted-foreground">
              {t('item-shop.not-giftable')}
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleSearchGift}>
              <Label className="text-xs">
                {t('item-shop.receiver')}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={giftSearch}
                  onChange={handleChangeGiftSearch}
                  placeholder={t('item-shop.receiver-search')}
                  disabled={isSearchingGift || isActing}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    isSearchingGift || giftSearch.trim() === ''
                  }
                >
                  {isSearchingGift ? (
                    <UpdateIcon className="animate-spin" />
                  ) : (
                    t('actions.search', { ns: 'general' })
                  )}
                </Button>
              </div>
              {giftLookup && !giftLookup.success && (
                <div className="text-muted-foreground text-xs">
                  {giftLookup.errorMessage ??
                    t('form.player.search-empty', { ns: 'general' })}
                </div>
              )}
              {giftLookup?.success && (
                <GiftReceiverInfo data={giftLookup.data} />
              )}
            </form>
          )}
          <DialogFooter>
            <Button
              onClick={handleGift}
              disabled={
                isActing ||
                !giftOffer?.giftable ||
                !giftLookup?.success
              }
            >
              {isActing ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                t('item-shop.gift')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
