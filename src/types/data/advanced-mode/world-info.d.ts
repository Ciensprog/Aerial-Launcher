export type WorldInfoResponse =
  | {
      data: WorldInfoData
      status: true
    }
  | {
      data: null
      status: false
    }

export type WorldInfoDeleteResponse = {
  filename: string
  status: boolean
}

export type WorldInfoExportResponse = {
  status: 'canceled' | 'error' | 'success'
}

export type WorldInfoFileData = {
  createdAt: Date
  data: WorldInfoData
  date: string
  filename: string
  id: string
  size: number
}

export type SaveWorldInfoData = {
  data: WorldInfoData
  date: strinng
}
