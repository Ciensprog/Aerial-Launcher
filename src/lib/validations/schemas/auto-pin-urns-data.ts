import { z } from 'zod'

export const autoPinUrnsServerDataSchema = z.boolean()
export const autoPinUrnsDataSchema = z.record(
  z.string(),
  autoPinUrnsServerDataSchema
)
