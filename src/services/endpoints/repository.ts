import type { RepositoryReleaseListResponse } from '../../types/services/repository'

import { repositoryService } from '../config/repository'

export function getAppReleases() {
  return repositoryService.get<RepositoryReleaseListResponse>('/releases')
}
