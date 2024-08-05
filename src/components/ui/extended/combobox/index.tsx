import type {
  ComboboxCustomItemRenderFunction,
  ComboboxProps,
} from './hooks'

import { Check, ChevronsUpDown, X } from 'lucide-react'

import { Button } from '../../button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandListWithScrollArea,
} from '../../command'
import { Popover, PopoverContent, PopoverTrigger } from '../../popover'

import { useData } from './hooks'

import { cn } from '../../../../lib/utils'

export function Combobox({
  className,
  classNamePopoverContent,
  customItem,
  defaultOpen,
  disabled,
  disabledItem,
  doNotDisableIfThereAreNoOptions,
  emptyContent,
  emptyContentClassname,
  emptyOptions,
  emptyPlaceholder,
  hideSelectorOnSelectItem,
  inputSearchIsDisabled,
  inputSearchValue,
  isMulti = false,
  options,
  placeholder,
  placeholderSearch,
  showNames,
  value,
  customFilter,
  onChange,
  onInputSearchChange,
  onSelectItem,
}: ComboboxProps) {
  const {
    __searchValue,
    currentValues,
    open,
    selectedName,

    setOpen,
    clearValues,
    __onChange,
    __onSearchValueChange,
  } = useData({
    defaultOpen,
    options,
    isMulti,
    onChange,
    showNames,
    value,
  })
  const innerInputSearchValue = inputSearchValue ?? __searchValue

  const customOnChange = (value: string) => {
    onSelectItem?.(value)
    __onChange(value)

    if (hideSelectorOnSelectItem) {
      setOpen(false)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex items-center relative w-full">
        <PopoverTrigger
          disabled={disabled}
          asChild
        >
          <Button
            className={cn(
              'flex justify-between max-w-96 pl-3 pr-2 select-none w-full disabled:hover:bg-background',
              className
            )}
            size="sm"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={
              disabled
                ? true
                : doNotDisableIfThereAreNoOptions
                  ? false
                  : options.length < 1
            }
          >
            <div
              className={cn('max-w-72 truncate', {
                'text-muted-foreground': currentValues.length <= 0,
              })}
            >
              {options.length > 0
                ? currentValues.length > 0
                  ? selectedName
                  : placeholder ?? 'Select options'
                : emptyPlaceholder ?? 'No options'}
            </div>
            <ChevronsUpDown className="h-4 ml-auto opacity-50 shrink-0 w-4" />
          </Button>
        </PopoverTrigger>
        {currentValues.length > 0 && (
          <button
            className="absolute p-0.5 right-7 text-muted-foreground hover:text-white"
            onClick={clearValues}
          >
            <X className="size-4" />
            <span className="sr-only">clear values</span>
          </button>
        )}
      </div>
      <PopoverContent
        className={cn('max-w-52 p-0 w-full', classNamePopoverContent)}
        align="start"
      >
        <Command
          filter={customFilter}
          loop
        >
          <CommandInput
            className="select-none"
            placeholder={placeholderSearch ?? 'Placeholder'}
            value={innerInputSearchValue}
            onValueChange={(value) => {
              __onSearchValueChange?.(value)
              onInputSearchChange?.(value)
            }}
            disabled={disabled || inputSearchIsDisabled}
          />
          <CommandListWithScrollArea>
            <CommandEmpty
              {...(options.length > 0 ||
              innerInputSearchValue.trim() !== ''
                ? emptyContentClassname
                  ? { className: emptyContentClassname }
                  : {}
                : {})}
            >
              {options.length > 0 ||
              innerInputSearchValue.trim() !== '' ? (
                emptyContent ? (
                  typeof emptyContent === 'function' ? (
                    emptyContent?.(innerInputSearchValue) ??
                    'No item found'
                  ) : (
                    emptyContent
                  )
                ) : (
                  'No item found'
                )
              ) : emptyOptions ? (
                <span className="text-xs">{emptyOptions}</span>
              ) : (
                'No item found'
              )}
            </CommandEmpty>
            {options.length > 0 && (
              <CommandGroup>
                {options?.map((option) => {
                  const hasItem = currentValues.find(
                    (item) => item.value === option.value
                  )
                  const renderItem: ComboboxCustomItemRenderFunction = (
                    props
                  ) => {
                    return (
                      <CommandItem
                        className={cn(props?.className)}
                        value={option.value}
                        keywords={option.keywords}
                        onSelect={disabled ? undefined : customOnChange}
                        disabled={disabledItem}
                        key={option.value}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            hasItem ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div
                          className={cn(
                            'max-w-[10rem] truncate',
                            props?.classNameTitle
                          )}
                        >
                          {option.label}
                        </div>
                      </CommandItem>
                    )
                  }

                  if (
                    innerInputSearchValue &&
                    !option.label
                      .toLowerCase()
                      .includes(innerInputSearchValue.toLowerCase())
                  ) {
                    return null
                  }

                  return (
                    customItem?.({
                      renderItem,
                      item: option,
                    }) ?? renderItem()
                  )
                })}
              </CommandGroup>
            )}
          </CommandListWithScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
