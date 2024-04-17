import type { AntiCheatProviderResponse } from '../../types/services/caldera'

import { calderaService } from '../config/caldera'

export function getAntiCheatProvider({
  accountId: account_id,
  exchangeCode: exchange_code,
}: {
  accountId: string
  exchangeCode: string
}) {
  return calderaService.post<AntiCheatProviderResponse>('/racp', {
    account_id,
    exchange_code,
    epic_app: 'fortnite',
    test_mode: false,
    nvidia: false,
    luna: false,
    salmon: false,
  })
}
