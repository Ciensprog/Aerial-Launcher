import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import {
  PackageOpen,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { AccountSelectors } from '../../../components/selectors/accounts'
import { GoToTop } from '../../../components/go-to-top'
import { RewardIcon } from '../../../components/reward-icon'
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'

import { Content as AutoLlamasContent } from '../auto-llamas/route'
import {
  groupInventory,
  useLlamaManagerPage,
} from './-hooks'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { parseResource } from '../../../lib/parsers/resources'
import { cn, parseCustomDisplayName } from '../../../lib/utils'
import { useGetAccounts } from '../../../hooks/accounts'

import type {
  LlamaManagerAccountData,
  LlamaManagerInventoryPack,
  LlamaManagerShopOffer,
} from '../../../types/llama-manager'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/llama-manager',
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
                {t('stw-operations.options.llama-manager')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Tabs
          defaultValue="manager"
          className="flex flex-grow flex-col"
        >
          <div className="flex justify-center px-2">
            <TabsList>
              <TabsTrigger value="manager">
                {t('stw-operations.options.llama-manager')}
              </TabsTrigger>
              <TabsTrigger value="auto">
                {t('stw-operations.options.auto-llamas')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="manager"
            className="mt-4 flex-grow"
          >
            <Content />
          </TabsContent>
          <TabsContent
            value="auto"
            className="mt-4 flex-grow"
          >
            <AutoLlamasContent />
          </TabsContent>
        </Tabs>
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['stw-operations'])

  const {
    accountOptions,
    isDisabledForm,
    isLoading,
    isActing,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tagOptions,
    accountsData,
    bulkMiniQty,
    bulkUpgradeQty,
    choiceDialog,
    manualSelectionIdx,

    updateAccounts,
    updateTags,
    setQuantity,
    getQuantity,
    setBulkMiniQty,
    setBulkUpgradeQty,
    setManualSelectionIdx,
    handleLoad,
    handlePurchase,
    handleBulkPurchaseMini,
    handleBulkPurchaseUpgrade,
    handleOpenAll,
    handleOpenTemplate,
    handleOpenGroup,
    openChoiceDialog,
    closeChoiceDialog,
    confirmChoiceOpen,
    handleOpenChoiceDefault,
    handleOpenAllChoice,
  } = useLlamaManagerPage()

  return (
    <>
      <div className="flex flex-grow">
        <div className="flex flex-col gap-5 items-center justify-center w-full px-2">
          <Card
            className="max-w-3xl w-full shadow-sm"
            id="llama-manager-card"
          >
            <CardHeader className="border-b space-y-2">
              <CardTitle className="flex gap-2 items-center text-lg">
                <span className="bg-primary/10 flex p-1.5 rounded-md">
                  <PackageOpen className="size-5 text-primary" />
                </span>
                {t('llama-manager.title')}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {t('llama-manager.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6">
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

              <div className="bg-muted/40 border gap-2 grid p-2.5 rounded-lg sm:grid-cols-2">
                <div className="flex gap-1.5 items-center">
                  <Input
                    id="bulk-mini-qty"
                    type="number"
                    min={1}
                    max={9999}
                    className="bg-background h-8 w-16 shrink-0"
                    value={bulkMiniQty}
                    onChange={(event) =>
                      setBulkMiniQty(
                        Math.max(1, Number(event.target.value) || 1),
                      )
                    }
                    disabled={isActing}
                    title={t('llama-manager.bulk.mini-hint')}
                  />
                  <Button
                    size="sm"
                    className="flex-1 h-8"
                    variant="secondary"
                    onClick={handleBulkPurchaseMini}
                    disabled={isDisabledForm}
                  >
                    {isActing ? (
                      <UpdateIcon className="animate-spin" />
                    ) : (
                      t('llama-manager.bulk.mini', { count: bulkMiniQty })
                    )}
                  </Button>
                </div>
                <div className="flex gap-1.5 items-center">
                  <Input
                    id="bulk-upgrade-qty"
                    type="number"
                    min={1}
                    max={9999}
                    className="bg-background h-8 w-16 shrink-0"
                    value={bulkUpgradeQty}
                    onChange={(event) =>
                      setBulkUpgradeQty(
                        Math.max(1, Number(event.target.value) || 1),
                      )
                    }
                    disabled={isActing}
                    title={t('llama-manager.bulk.upgrade-hint')}
                  />
                  <Button
                    size="sm"
                    className="flex-1 h-8"
                    onClick={handleBulkPurchaseUpgrade}
                    disabled={isDisabledForm}
                  >
                    {isActing ? (
                      <UpdateIcon className="animate-spin" />
                    ) : (
                      t('llama-manager.bulk.upgrade', {
                        count: bulkUpgradeQty,
                      })
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20">
              <Button
                className="w-full"
                onClick={handleLoad}
                disabled={isDisabledForm}
              >
                {isLoading ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  t('llama-manager.form.load')
                )}
              </Button>
            </CardFooter>
          </Card>

          {accountsData.length > 0 && (
            <div className="gap-4 grid max-w-3xl w-full">
              {accountsData.map((accountData) => (
                <AccountLlamaPanel
                  key={accountData.accountId}
                  data={accountData}
                  isActing={isActing}
                  getQuantity={getQuantity}
                  setQuantity={setQuantity}
                  onPurchase={handlePurchase}
                  onOpenAll={handleOpenAll}
                  onOpenTemplate={handleOpenTemplate}
                  onOpenGroup={handleOpenGroup}
                  onOpenChoice={openChoiceDialog}
                  onOpenChoiceDefault={handleOpenChoiceDefault}
                  onOpenAllChoice={handleOpenAllChoice}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={choiceDialog !== null}
        onOpenChange={(open) => {
          if (!open) closeChoiceDialog()
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('llama-manager.choice.title')}</DialogTitle>
            <DialogDescription>
              {choiceDialog?.pack.name}
            </DialogDescription>
          </DialogHeader>

          {choiceDialog && (
            <div className="grid gap-3">
              {choiceDialog.pack.choiceOptions.length > 0 ? (
                <div className="gap-2 grid max-h-64 overflow-y-auto">
                  {choiceDialog.pack.choiceOptions.map((option) => {
                    const parsed = parseResource({
                      key: option.itemType,
                      quantity: option.quantity,
                    })

                    return (
                      <button
                        type="button"
                        key={`${option.itemType}-${option.index}`}
                        className={cn(
                          'border flex gap-3 items-center px-3 py-2 rounded-lg text-left text-sm transition-colors',
                          manualSelectionIdx === option.index
                            ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                            : 'hover:bg-muted',
                        )}
                        onClick={() =>
                          setManualSelectionIdx(option.index)
                        }
                      >
                        <RewardIcon
                          src={parsed.imgUrl}
                          fallback={parsed.fallbackUrl}
                          alt=""
                          title={parsed.name}
                          className="size-8"
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {parsed.name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            x{option.quantity}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="manual-idx">
                    {t('llama-manager.choice.manual-index')}
                  </Label>
                  <Input
                    id="manual-idx"
                    type="number"
                    min={0}
                    value={manualSelectionIdx}
                    onChange={(event) =>
                      setManualSelectionIdx(
                        Math.max(0, Number(event.target.value) || 0),
                      )
                    }
                  />
                  <p className="text-muted-foreground text-xs">
                    {t('llama-manager.choice.manual-hint')}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={closeChoiceDialog}
            >
              {t('llama-manager.choice.cancel')}
            </Button>
            <Button
              onClick={confirmChoiceOpen}
              disabled={isActing}
            >
              {isActing ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                t('llama-manager.choice.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GoToTop containerId="llama-manager-card" />
    </>
  )
}

function AccountLlamaPanel({
  data,
  isActing,
  getQuantity,
  setQuantity,
  onPurchase,
  onOpenAll,
  onOpenTemplate,
  onOpenGroup,
  onOpenChoice,
  onOpenChoiceDefault,
  onOpenAllChoice,
}: {
  data: LlamaManagerAccountData
  isActing: boolean
  getQuantity: (key: string, fallback?: number) => number
  setQuantity: (key: string, value: number) => void
  onPurchase: (accountId: string, offer: LlamaManagerShopOffer) => void
  onOpenAll: (accountId: string) => void
  onOpenTemplate: (
    accountId: string,
    templateId: string,
    quantity: number,
  ) => void
  onOpenGroup: (
    accountId: string,
    packs: Array<LlamaManagerInventoryPack>,
    quantity?: number,
  ) => void
  onOpenChoice: (
    accountId: string,
    pack: LlamaManagerInventoryPack,
  ) => void
  onOpenChoiceDefault: (
    accountId: string,
    pack: LlamaManagerInventoryPack,
    selectionIdx?: number,
  ) => void
  onOpenAllChoice: (
    accountId: string,
    packs?: Array<LlamaManagerInventoryPack>,
    selectionIdx?: number,
  ) => void
}) {
  const { t } = useTranslation(['stw-operations'])
  const { accountList } = useGetAccounts()
  const account = accountList[data.accountId]

  const inventoryGroups = groupInventory(data.inventory)
  const regularGroups = inventoryGroups.filter((g) => !g.isChoicePack)
  const choiceGroups = inventoryGroups.filter((g) => g.isChoicePack)
  const regularCount = data.inventory.filter((p) => !p.isChoicePack).length
  const choiceCount = data.inventory.filter((p) => p.isChoicePack).length
  // Shop already filtered server-side to available only
  const shopOffers = data.shop

  return (
    <Card className="w-full overflow-hidden shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-3 space-y-2">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <CardTitle className="text-base truncate">
            {parseCustomDisplayName(account)}
          </CardTitle>
          {data.error && (
            <Badge variant="destructive">
              {t('llama-manager.errors.' + data.error, {
                defaultValue: data.error,
              })}
            </Badge>
          )}
        </div>
        {data.currencies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.currencies.slice(0, 8).map((currency) => {
              const parsed = parseResource({
                key: currency.templateId,
                quantity: currency.quantity,
              })

              return (
                <div
                  key={currency.templateId}
                  className="bg-background border flex gap-1.5 items-center px-2 py-1 rounded-full text-xs"
                  title={currency.name}
                >
                  <img
                    src={parsed.imgUrl}
                    alt=""
                    className="size-4"
                  />
                  <span className="font-semibold tabular-nums">
                    {numberWithCommaSeparator(currency.quantity)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        <Tabs defaultValue="inventory">
          <TabsList className="grid grid-cols-3 h-auto w-full p-1">
            <TabsTrigger
              value="inventory"
              className="gap-1.5 py-2 text-xs sm:text-sm"
            >
              <PackageOpen className="size-3.5" />
              <span className="truncate">
                {t('llama-manager.tabs.inventory')}
              </span>
              {regularCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[0.65rem]"
                >
                  {regularCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="shop"
              className="gap-1.5 py-2 text-xs sm:text-sm"
            >
              <ShoppingBag className="size-3.5" />
              <span className="truncate">
                {t('llama-manager.tabs.shop')}
              </span>
              {shopOffers.length > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[0.65rem]"
                >
                  {shopOffers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="choice"
              className="gap-1.5 py-2 text-xs sm:text-sm"
            >
              <Sparkles className="size-3.5" />
              <span className="truncate">
                {t('llama-manager.tabs.choice')}
              </span>
              {choiceCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[0.65rem]"
                >
                  {choiceCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="inventory"
            className="mt-4 space-y-3"
          >
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {t('llama-manager.inventory.summary', {
                  total: data.inventory.length,
                  regular: regularCount,
                  choice: choiceCount,
                })}
              </p>
              <Button
                size="sm"
                onClick={() => onOpenAll(data.accountId)}
                disabled={isActing || regularCount <= 0}
              >
                {t('llama-manager.inventory.open-all', {
                  count: regularCount,
                })}
              </Button>
            </div>

            {regularGroups.length <= 0 ? (
              <EmptyState text={t('llama-manager.inventory.empty')} />
            ) : (
              <div className="gap-2 grid">
                {regularGroups.map((group) => {
                  const qtyKey = `${data.accountId}:inv:${group.templateId}`
                  const qty = getQuantity(
                    qtyKey,
                    Math.min(10, group.total),
                  )

                  return (
                    <div
                      key={group.templateId}
                      className="bg-card border flex flex-col gap-2 px-3 py-2.5 rounded-lg sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">
                          {group.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {t('llama-manager.inventory.count', {
                            count: group.total,
                          })}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Input
                          type="number"
                          min={1}
                          max={group.total}
                          className="h-8 w-16"
                          value={qty}
                          onChange={(event) =>
                            setQuantity(
                              qtyKey,
                              Math.min(
                                group.total,
                                Number(event.target.value) || 1,
                              ),
                            )
                          }
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isActing}
                          onClick={() =>
                            onOpenTemplate(
                              data.accountId,
                              group.templateId,
                              qty,
                            )
                          }
                        >
                          {t('llama-manager.inventory.open-n', {
                            count: qty,
                          })}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isActing}
                          onClick={() =>
                            onOpenGroup(
                              data.accountId,
                              group.packs,
                              group.packs.length,
                            )
                          }
                        >
                          {t('llama-manager.inventory.open-max')}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="shop"
            className="mt-4 space-y-3"
          >
            {shopOffers.length <= 0 ? (
              <EmptyState text={t('llama-manager.shop.empty')} />
            ) : (
              <div className="gap-2 grid">
                {shopOffers.map((offer) => {
                  const qtyKey = `${data.accountId}:shop:${offer.offerId}`
                  const max =
                    offer.remaining !== null
                      ? Math.max(offer.remaining, 1)
                      : 999
                  const qty = getQuantity(qtyKey, 1)
                  const currencyName = offer.currencySubType
                    ? parseResource({
                        key: offer.currencySubType,
                        quantity: offer.price,
                      }).name
                    : offer.currencyType

                  return (
                    <div
                      key={offer.offerId}
                      className="bg-card border flex flex-col gap-2 px-3 py-2.5 rounded-lg"
                    >
                      <div className="flex flex-wrap gap-2 items-start justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="font-medium text-sm">
                              {offer.title}
                            </span>
                            {offer.isFree && (
                              <Badge className="h-5 text-[0.65rem]">
                                {t('llama-manager.shop.free')}
                              </Badge>
                            )}
                            {offer.isXRay && (
                              <Badge
                                variant="secondary"
                                className="h-5 text-[0.65rem]"
                              >
                                X-Ray
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {offer.isFree
                              ? t('llama-manager.shop.price-free')
                              : t('llama-manager.shop.price', {
                                  price: numberWithCommaSeparator(
                                    offer.price,
                                  ),
                                  currency: currencyName,
                                })}
                            {offer.remaining !== null && (
                              <>
                                {' · '}
                                {t('llama-manager.shop.remaining', {
                                  count: offer.remaining,
                                })}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min={1}
                            max={max}
                            className="h-8 w-16"
                            value={qty}
                            onChange={(event) =>
                              setQuantity(
                                qtyKey,
                                Math.min(
                                  max,
                                  Number(event.target.value) || 1,
                                ),
                              )
                            }
                          />
                          <Button
                            size="sm"
                            disabled={isActing}
                            onClick={() =>
                              onPurchase(data.accountId, offer)
                            }
                          >
                            {t('llama-manager.shop.buy', {
                              count: qty,
                            })}
                          </Button>
                        </div>
                      </div>

                      {offer.prerollItems.length > 0 && (
                        <>
                          <Separator />
                          <div className="flex flex-wrap gap-1.5">
                            {offer.prerollItems.map((item, index) => {
                              const parsed = parseResource({
                                key: item.itemType,
                                quantity: item.quantity,
                              })

                              return (
                                <div
                                  key={`${item.itemType}-${index}`}
                                  className="bg-muted/50 flex gap-1 items-center px-1.5 py-0.5 rounded text-[0.7rem]"
                                  title={parsed.name}
                                >
                                  <RewardIcon
                                    src={parsed.imgUrl}
                                    fallback={parsed.fallbackUrl}
                                    alt=""
                                    title={parsed.name}
                                    className="size-4"
                                  />
                                  <span className="max-w-[8rem] truncate">
                                    {parsed.name}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="choice"
            className="mt-4 space-y-3"
          >
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <p className="text-muted-foreground text-sm max-w-md">
                {t('llama-manager.choice.hint')}
              </p>
              <Button
                size="sm"
                disabled={isActing || choiceCount <= 0}
                onClick={() => onOpenAllChoice(data.accountId)}
              >
                <Sparkles className="mr-1.5 size-3.5" />
                {t('llama-manager.choice.open-all', {
                  count: choiceCount,
                })}
              </Button>
            </div>

            {choiceGroups.length <= 0 ? (
              <EmptyState text={t('llama-manager.choice.empty')} />
            ) : (
              <div className="gap-3 grid">
                {choiceGroups.map((group) => (
                  <div
                    key={group.templateId}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="bg-muted/40 flex flex-wrap gap-2 items-center justify-between px-3 py-2">
                      <div className="min-w-0">
                        <div className="flex gap-2 items-center">
                          <span className="font-medium text-sm truncate">
                            {group.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="h-5 text-[0.65rem]"
                          >
                            CP
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="h-5 text-[0.65rem]"
                          >
                            ×{group.total}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isActing}
                        onClick={() =>
                          onOpenAllChoice(data.accountId, group.packs, 0)
                        }
                      >
                        {t('llama-manager.choice.open-group-all')}
                      </Button>
                    </div>
                    <div className="gap-1.5 grid p-2">
                      {group.packs.map((pack) => (
                        <div
                          key={pack.itemId}
                          className="bg-card border flex flex-col gap-2 px-2.5 py-2 rounded-md sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {pack.name}
                            </div>
                            {pack.choiceOptions.length > 0 && (
                              <div className="text-muted-foreground text-xs">
                                {t('llama-manager.choice.options', {
                                  count: pack.choiceOptions.length,
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              className="h-8"
                              disabled={isActing}
                              onClick={() =>
                                onOpenChoice(data.accountId, pack)
                              }
                            >
                              {t('llama-manager.choice.open')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              disabled={isActing}
                              onClick={() =>
                                onOpenChoiceDefault(
                                  data.accountId,
                                  pack,
                                  0,
                                )
                              }
                            >
                              {t('llama-manager.choice.open-default')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed py-10 rounded-lg text-center text-muted-foreground text-sm">
      {text}
    </div>
  )
}
