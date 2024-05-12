import type { StylesConfig } from 'react-select'

import chroma from 'chroma-js'
import Select from 'react-select'

import { defaultColor } from '../../../../config/constants/colors'

export type SelectOption = {
  color?: string
  label: string
  value: string
}

export function InputTags({
  options,
  value,

  onChange,
}: {
  options: Array<SelectOption>
  value: Array<SelectOption>

  onChange: (value: Array<SelectOption>) => void
}) {
  return (
    <Select
      placeholder="Select some tags..."
      options={options}
      value={value}
      styles={colourStyles}
      classNames={{
        clearIndicator: () => 'px-1 text-muted-foreground',
        container: () => 'border rounded-md',
        control: () => 'bg-background pl-3 pr-2 py-1.5 rounded-md',
        dropdownIndicator: () => 'pl-1.5 text-muted-foreground',
        indicatorSeparator: () => 'bg-[hsl(var(--border))]',
        input: () => 'text-sm',
        menu: () => 'bg-background border mt-2 rounded-md z-20',
        multiValue: () => 'max-w-56 rounded',
        multiValueLabel: () => 'px-1.5',
        multiValueRemove: () => 'px-1.5 rounded-r',
        noOptionsMessage: () => 'py-3 text-muted-foreground',
        option: () => 'overflow-hidden px-2 py-1 text-ellipsis',
        placeholder: () => 'text-muted-foreground text-sm',
        valueContainer: () => 'gap-1',
      }}
      closeMenuOnSelect={false}
      onChange={(values) => {
        onChange(values as Array<SelectOption>)

        return
      }}
      isMulti
      unstyled
    />
  )
}

function getDefaultColor(color?: string) {
  return color ?? defaultColor
}

const colourStyles: StylesConfig<SelectOption, true> = {
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const currentColor = getDefaultColor(data.color)
    const color = chroma(currentColor)

    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
          ? currentColor
          : isFocused
            ? color.alpha(0.1).css()
            : undefined,
      color: isDisabled
        ? '#666666'
        : isSelected
          ? chroma.contrast(color, 'white') > 2
            ? 'white'
            : 'black'
          : currentColor,
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled
          ? isSelected
            ? currentColor
            : color.alpha(0.3).css()
          : undefined,
      },
    }
  },
  multiValue: (styles, { data }) => {
    const color = chroma(getDefaultColor(data.color))
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    }
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: getDefaultColor(data.color),
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: getDefaultColor(data.color),
    ':hover': {
      backgroundColor: getDefaultColor(data.color),
      color: 'white',
    },
  }),
}
