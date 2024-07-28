export type AddNewFriendNotification =
  | {
      data: null
      displayName: string
      errorMessage: number | string | null
      success: false
    }
  | {
      data: {
        accountId: string
        displayName: string
      }
      displayName: string
      errorMessage: null
      success: true
    }
