export type WorldInfoResponse =
  | {
      data: WorldInfoData
      status: true
    }
  | {
      data: null
      status: false
    }

export type WorldInfoFileData = {
  createdAt: Date
  data: WorldInfoData
  date: string
  filename: string
  size: number
}

export type SaveWorldInfoData = {
  data: WorldInfoData
  date: strinng
}
