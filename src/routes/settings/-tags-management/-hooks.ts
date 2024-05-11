import type { ChangeEventHandler, FormEventHandler } from 'react'
import type { Tag, TagRecord } from '../../../types/tags'

import Color from 'color'
import { useEffect, useState } from 'react'

import { defaultColor } from '../../../config/constants/colors'

import { useTagsStore } from '../../../state/settings/tags'

export function useFormCreate() {
  const tagsStore = useTagsStore()
  const [currentTag, setTagsValue] = useState('')
  const [isSubmittingTag, setIsSubmittingTag] = useState(false)

  useEffect(() => {
    const listener = window.electronAPI.notificationCreationTags(
      async () => {
        setIsSubmittingTag(false)
        setTagsValue('')
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const onChangeInputTagValue: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setTagsValue(event.currentTarget.value.replace(/\s+/g, ' '))
  }

  const onSubmitTag: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    if (isSubmittingTag) {
      return
    }

    const tagName = currentTag.trim()

    if (tagName === '') {
      return
    }

    setIsSubmittingTag(true)

    const newTags: TagRecord = {
      [tagName]: tagsStore.tags[tagName] ?? null,
    }

    tagsStore.updateTags(newTags)
    window.electronAPI.updateTags({
      ...tagsStore.tags,
      ...newTags,
    })
  }

  return {
    currentTag,
    isSubmittingTag,

    onChangeInputTagValue,
    onSubmitTag,
  }
}

export function useFormUpdate({ rawData }: { rawData: Tag }) {
  const tagsStore = useTagsStore()
  const [color, setColor] = useState(
    () => (rawData.color ?? defaultColor) as string
  )
  const [name, setName] = useState('')

  useEffect(() => {
    setColor((rawData.color ?? defaultColor) as string)
  }, [rawData])

  const onChangeColor = (value: string) => {
    if (color !== value) {
      setColor(value.replace(/\s+/g, ''))
    }
  }

  const onChangeName: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.currentTarget.value.replace(/\s+/g, ' '))
  }

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const newData = {
      color: color.trim() === '' ? null : color.trim(),
      name: name.trim() === '' ? rawData.name : name.trim(),
    }

    try {
      if (newData.color !== null) {
        newData.color = Color(newData.color as string).hex()
      }
    } catch (error) {
      newData.color = null
    }

    const rawTagsArray = Object.entries(tagsStore.tags).filter(
      ([tagName]) => tagName !== rawData.name
    )
    const rawTagsRecord = rawTagsArray.reduce(
      (accumulator, [key, value]) => {
        accumulator[key] = value

        return accumulator
      },
      {} as TagRecord
    )
    const newTags: TagRecord = {
      ...rawTagsRecord,
      [newData.name]: (newData.color ?? null) as Tag['color'],
    }

    tagsStore.updateTags(newTags, true)
    window.electronAPI.updateTags(newTags)

    setName('')
  }

  return {
    color,
    name,

    onChangeColor,
    onChangeName,
    onSubmit,
  }
}
