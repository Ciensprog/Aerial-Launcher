export type WorldInfoResponse =
  | {
      data: WorldInfoData
      status: true
    }
  | {
      data: null
      status: false
    }

export type SaveWorldInfoData = {
  data: WorldInfoData
  date: strinng
}
