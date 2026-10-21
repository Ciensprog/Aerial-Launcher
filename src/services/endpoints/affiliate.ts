import { affiliateService } from '../config/affiliate'

export type AffiliateSlugResponse = {
  id: string
  slug: string
  displayName: string
  status: string
}

export function lookupAffiliateSlug({ slug }: { slug: string }) {
  return affiliateService.get<AffiliateSlugResponse>(
    `/slug/${encodeURIComponent(slug)}`
  )
}
