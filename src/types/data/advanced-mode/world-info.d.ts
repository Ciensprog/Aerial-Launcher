export type WorldInfoResponse =
  | {
      data: WorldInfoData
      status: true
    }
  | {
      data: null
      status: false
    }
