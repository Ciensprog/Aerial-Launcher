import { Gift } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../components/ui/button'

import { ShopOfferImage } from './-offer-image'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { cn } from '../../../lib/utils'

import type { ItemShopOffer } from '../../../types/item-shop'

function remainingLabel(outDate: string | null | undefined, now: number) {
  if (!outDate) {
    return null
  }

  const end = new Date(outDate).getTime()

  if (Number.isNaN(end)) {
    return null
  }

  const diff = end - now

  if (diff <= 60_000) {
    return 'soon'
  }

  const totalMinutes = Math.floor(diff / 60_000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) {
    return `${days}d ${hours}h`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

export function OfferGrid({
  offers,
  disabled,
  catalogExpiration,
  onBuy,
  onGift,
}: {
  offers: Array<ItemShopOffer>
  disabled: boolean
  catalogExpiration?: string | null
  onBuy: (offer: ItemShopOffer) => void
  onGift: (offer: ItemShopOffer) => void
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 30_000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
      {offers.map((offer) => (
        <OfferCard
          key={offer.offerId}
          offer={offer}
          disabled={disabled}
          now={now}
          catalogExpiration={catalogExpiration}
          onBuy={() => onBuy(offer)}
          onGift={() => onGift(offer)}
        />
      ))}
    </div>
  )
}

function OfferCard({
  offer,
  disabled,
  now,
  catalogExpiration,
  onBuy,
  onGift,
}: {
  offer: ItemShopOffer
  disabled: boolean
  now: number
  catalogExpiration?: string | null
  onBuy: () => void
  onGift: () => void
}) {
  const { t } = useTranslation(['stw-operations'])
  const remaining = remainingLabel(offer.outDate || catalogExpiration, now)

  return (
    <article
      className={cn(
        'flex flex-col border rounded-lg overflow-hidden bg-muted/20',
        rarityBorder(offer.rarity)
      )}
    >
      <ShopOfferImage
        src={offer.imageUrl}
        className="h-28 w-full object-contain"
      />
      <div className="flex flex-col gap-1 p-2">
        <div className="font-medium leading-tight text-sm truncate">
          {offer.title}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          {offer.type} · {offer.section}
        </div>
        <div className="text-xs">
          {t('item-shop.price', {
            price: numberWithCommaSeparator(offer.price),
          })}
        </div>
        {remaining ? (
          <div className="text-[11px] text-muted-foreground">
            {remaining === 'soon'
              ? t('item-shop.leaves-soon')
              : t('item-shop.leaves', { time: remaining })}
          </div>
        ) : null}
        <div className="flex gap-1 mt-1">
          <Button
            size="sm"
            className="flex-1 h-8"
            onClick={onBuy}
            disabled={disabled || !offer.offerId}
          >
            {t('item-shop.buy')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2"
            onClick={onGift}
            disabled={disabled || !offer.giftable}
            title={t('item-shop.gift')}
          >
            <Gift className="size-3.5" />
          </Button>
        </div>
      </div>
    </article>
  )
}

function rarityBorder(rarity: string) {
  const value = rarity.toLowerCase()

  if (value.includes('mythic') || value.includes('legendary')) {
    return 'border-amber-400/70'
  }

  if (value.includes('epic')) {
    return 'border-purple-400/70'
  }

  if (value.includes('rare')) {
    return 'border-sky-400/70'
  }

  if (value.includes('uncommon')) {
    return 'border-green-400/70'
  }

  return 'border-border'
}
