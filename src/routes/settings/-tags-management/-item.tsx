import type { Tag } from '../../../types/tags'

import { ColorInput } from '@mantine/core'
import { Trash2 } from 'lucide-react'

import { defaultColor } from '../../../config/constants/colors'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

import { useFormUpdate } from './-hooks'

export function TagItem({ data }: { data: Tag }) {
  const {
    color,
    name,
    onChangeColor,
    onChangeName,
    onDeleteTag,
    onSubmit,
  } = useFormUpdate({
    rawData: data,
  })

  return (
    <div className="flex gap-4 relative">
      <form
        className="flex flex-grow gap-2 items-center relative rounded-md"
        onSubmit={onSubmit}
      >
        <ColorInput
          placeholder={defaultColor}
          value={color}
          onChange={onChangeColor}
          withEyeDropper={false}
        />
        <Input
          className="pr-20"
          placeholder={data.name}
          value={name}
          onChange={onChangeName}
        />
        <Button
          type="submit"
          variant="secondary"
          className="absolute h-8 px-2 right-1 w-auto"
        >
          Update
        </Button>
      </form>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="flex flex-shrink-0 justify-center text-[#ff6868]/60 [&:not(:disabled)]:hover:text-[#ff6868]"
        onClick={onDeleteTag(data.name)}
      >
        <Trash2 size={16} />
        <span className="sr-only">remove tag</span>
      </Button>
    </div>
  )
}
