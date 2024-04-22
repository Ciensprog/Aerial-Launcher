export type RepositoryReleaseResponse = {
  url: string
  assets_url: string
  upload_url: string
  html_url: string
  id: number
  author: Record<string, unknown>
  node_id: string
  tag_name: string
  target_commitish: string
  name: string
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string
  assets: Array<Record<string, unknown>>
  tarball_url: string
  zipball_url: string
  body: string
}

export type RepositoryReleaseListResponse =
  Array<RepositoryReleaseResponse>
