import { useState } from 'react'

export type ComboboxOption = {
  label: string
  value: string
}

export type ComboboxProps = {
  className?: string
  emptyText?: string
  isMulti?: boolean
  options: Array<ComboboxOption>
  placeholder?: string
  placeholderSearch?: string
  value?: Array<ComboboxOption>
  onChange?: (values: Array<ComboboxOption>) => void
}

export function useData({
  isMulti = false,
  options,
  value,
  onChange,
}: Pick<ComboboxProps, 'isMulti' | 'options' | 'value' | 'onChange'>) {
  const [open, setOpen] = useState(false)
  const [__values, __setValues] = useState<Array<ComboboxOption>>([])

  const currentValues = value ?? __values

  const selectedName = isMulti
    ? currentValues.length > 1
      ? `${currentValues.length} selected`
      : currentValues[0]?.label
    : options.find((item) => item.value === currentValues[0]?.value)?.label

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

  return {
    currentValues,
    open,
    selectedName,

    setOpen,
    __onChange,
  }
}
