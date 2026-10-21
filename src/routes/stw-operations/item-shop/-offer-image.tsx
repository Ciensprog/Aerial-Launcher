import { ShoppingBag } from 'lucide-react'

export function ShopOfferImage({
  src,
  className,
}: {
  src: string | null
  className?: string
}) {
  if (!src) {
    return (
      <div className="bg-black/40 flex items-center justify-center min-h-24">
        <ShoppingBag className="size-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="bg-black/40 flex items-center justify-center min-h-24">
      <img
        src={src}
        alt=""
        className={className}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    </div>
  )
}
