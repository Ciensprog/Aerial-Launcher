import type { ChangeEventHandler, FormEventHandler } from 'react'
import type { GroupRecord } from '../../../types/groups'
import type { Tag, TagRecord } from '../../../types/tags'

import Color from 'color'
import { useEffect, useState } from 'react'

import { defaultColor } from '../../../config/constants/colors'

import {
  useGetHomebaseNameActions,
  useGetHomebaseNameData,
} from '../../../hooks/stw-operations/homebase-name'
import {
  useGetSaveQuestsActions,
  useGetSaveQuestsData,
} from '../../../hooks/stw-operations/save-quests'
import {
  useGetXPBoostsActions,
  useGetXPBoostsFormData,
} from '../../../hooks/stw-operations/xpboosts'
import { useGetGroups } from '../../../hooks/groups'
import { useGetTags } from '../../../hooks/tags'

import { useTagsStore } from '../../../state/settings/tags'

export function useGetFilteredTags() {
  const { tagsArray } = useGetTags()
  const [searchValue, setSearchValue] = useState('')

  const filteredTags =
    searchValue.length > 0
      ? tagsArray.filter(([tagName]) =>
          tagName
            .toLowerCase()
            .trim()
            .includes(searchValue.toLowerCase().trim())
        )
      : tagsArray

  const onChangeSearchValue: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setSearchValue(event.currentTarget.value.replace(/\s+/g, ' '))
  }

  return {
    filteredTags,
    searchValue,
    tagsArray,

    onChangeSearchValue,
  }
}

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

  const { groupList, registerGroups } = useGetGroups()

  const saveQuestsData = useGetSaveQuestsData()
  const { rawSaveQuestsUpdateTags } = useGetSaveQuestsActions()

  const homebaseNameData = useGetHomebaseNameData()
  const { rawHomebaseNameUpdateTags } = useGetHomebaseNameActions()

  const xpBoostsFormData = useGetXPBoostsFormData()
  const { rawXPBoostsUpdateTags } = useGetXPBoostsActions()

  useEffect(() => {
    setColor((rawData.color ?? defaultColor) as string)
  }, [rawData])

  const filterTags = (currentTagName: string) => {
    const rawTagsArray = Object.entries(tagsStore.tags).filter(
      ([tagName]) => tagName !== currentTagName
    )

    return rawTagsArray.reduce((accumulator, [key, value]) => {
      accumulator[key] = value

      return accumulator
    }, {} as TagRecord)
  }

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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      newData.color = null
    }

    const rawTagsRecord = filterTags(rawData.name)
    const newTags: TagRecord = {
      ...rawTagsRecord,
      [newData.name]: (newData.color ?? null) as Tag['color'],
    }

    const newGroups = Object.entries(groupList).reduce(
      (accumulator, [accountId, tags]) => {
        accumulator[accountId] = tags.map((currentTag) =>
          currentTag === rawData.name ? newData.name : currentTag
        )

        return accumulator
      },
      {} as GroupRecord
    )

    registerGroups(newGroups)

    rawSaveQuestsUpdateTags(
      saveQuestsData.selectedTags.map((currentTag) =>
        currentTag === rawData.name ? newData.name : currentTag
      )
    )
    rawHomebaseNameUpdateTags(
      homebaseNameData.selectedTags.map((currentTag) =>
        currentTag === rawData.name ? newData.name : currentTag
      )
    )
    rawXPBoostsUpdateTags(
      xpBoostsFormData.selectedTags.map((currentTag) =>
        currentTag === rawData.name ? newData.name : currentTag
      )
    )
    tagsStore.updateTags(newTags, true)

    window.electronAPI.updateTags(newTags)
    window.electronAPI.updateGroups(newGroups)

    setName('')
  }

  const onDeleteTag = (tagName: string) => () => {
    const rawTagsRecord = filterTags(tagName)
    const newGroups = Object.entries(groupList).reduce(
      (accumulator, [accountId, tags]) => {
        accumulator[accountId] = tags.filter(
          (currentTag) => currentTag !== tagName
        )

        return accumulator
      },
      {} as GroupRecord
    )

    registerGroups(newGroups)

    rawSaveQuestsUpdateTags(
      saveQuestsData.selectedTags.filter(
        (currentTag) => currentTag !== tagName
      )
    )
    rawHomebaseNameUpdateTags(
      homebaseNameData.selectedTags.filter(
        (currentTag) => currentTag !== tagName
      )
    )
    rawXPBoostsUpdateTags(
      xpBoostsFormData.selectedTags.filter(
        (currentTag) => currentTag !== tagName
      )
    )
    tagsStore.updateTags(rawTagsRecord, true)

    window.electronAPI.updateTags(rawTagsRecord)
    window.electronAPI.updateGroups(newGroups)
  }

  return {
    color,
    name,

    onChangeColor,
    onChangeName,
    onDeleteTag,
    onSubmit,
  }
}
