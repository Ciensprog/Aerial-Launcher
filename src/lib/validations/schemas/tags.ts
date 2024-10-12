import Color from 'color'
import { z } from 'zod'

export const colorSchema = z.custom<`#${string}`>((value: string) => {
  try {
    Color(value).hex()

    return true

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    //
  }

  return false
})

export const tagSchema = z.object({
  name: z.string().min(1),
  color: colorSchema.nullable(),
})
export const tagsSchema = z.record(
  z.string().min(1),
  colorSchema.nullable()
)
