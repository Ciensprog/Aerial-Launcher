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
  assets: Array<{
    url: string
    id: number
    node_id: string
    name: string
    label: string
    uploader: Record<string, unknown>
    content_type: string
    state: string
    size: number
    download_count: number
    created_at: string
    updated_at: string
    browser_download_url: string
  }>
  tarball_url: string
  zipball_url: string
  body: string
}

export type RepositoryReleaseListResponse =
  Array<RepositoryReleaseResponse>
