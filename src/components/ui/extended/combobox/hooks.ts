import type { ReactNode } from 'react'

import { useState } from 'react'

export type ComboboxOption = {
  label: string
  value: string
  keywords: Array<string>
}

export type ComboboxProps = {
  className?: string
  defaultOpen?: boolean
  disabled?: boolean
  disabledItem?: boolean
  doNotDisableIfThereAreNoOptions?: boolean
  emptyContent?: ((value: string) => ReactNode) | string
  emptyContentClassname?: string
  emptyOptions?: string
  emptyPlaceholder?: string
  hideSelectorOnSelectItem?: boolean
  inputSearchIsDisabled?: boolean
  inputSearchValue?: string
  isMulti?: boolean
  options: Array<ComboboxOption>
  placeholder?: string
  placeholderSearch?: string
  showNames?: boolean
  value?: Array<ComboboxOption>
  customFilter?: (
    value: string,
    search: string,
    keywords?: Array<string>
  ) => number
  onChange?: (values: Array<ComboboxOption>) => void
  onInputSearchChange?: (values: string) => void
  onSelectItem?: (value: string) => void
}

export function useData({
  defaultOpen,
  isMulti = false,
  options,
  showNames,
  value,
  onChange,
}: Pick<
  ComboboxProps,
  | 'defaultOpen'
  | 'isMulti'
  | 'options'
  | 'showNames'
  | 'value'
  | 'onChange'
>) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const [__values, __setValues] = useState<Array<ComboboxOption>>([])
  const [__searchValue, __setSearchValue] = useState('')

  const currentValues = value ?? __values

  const selectedName = isMulti
    ? currentValues.length > 1
      ? showNames
        ? `${currentValues.map(({ label }) => label).join(', ')}`
        : `${currentValues.length} selected`
      : currentValues[0]?.label
    : options.find((item) => item.value === currentValues[0]?.value)?.label

  const clearValues = () => {
    __setValues([])
    onChange?.([])
  }

  const __onChange = (value: string) => {
    const current = options.find((item) => item.value === value)
    const hasItem = currentValues.find((item) => item.value === value)
    const update = (values: Array<ComboboxOption>) => {
      __setValues(values)
      onChange?.(values)
    }

    if (!current) {
      return
    }

    if (!isMulti) {
      update(hasItem ? [] : [current])

      return
    }

    const newValues = hasItem
      ? currentValues.filter((item) => item.value !== value)
      : current
        ? [...currentValues, current]
        : currentValues

    update(newValues)
  }

  const __onSearchValueChange = (value: string) => {
    __setSearchValue(value)
  }

  return {
    __searchValue,
    currentValues,
    open,
    selectedName,

    setOpen,
    clearValues,
    __onChange,
    __onSearchValueChange,
  }
}
