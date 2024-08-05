export enum BulkTags {
  ALL = 'all',
  ALL_ACCOUNTS = 'all accounts',
  BULK = 'bulk',
}

export function getBulkTags() {
  return [BulkTags.ALL, BulkTags.ALL_ACCOUNTS, BulkTags.BULK]
}
