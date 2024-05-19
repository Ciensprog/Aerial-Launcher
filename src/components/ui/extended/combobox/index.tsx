import type { ComboboxProps } from './hooks'

import { Check, ChevronsUpDown } from 'lucide-react'

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
  emptyText,
  isMulti = false,
  options,
  placeholder,
  placeholderSearch,
  value,
  onChange,
}: ComboboxProps) {
  const { __onChange, currentValues, open, selectedName, setOpen } =
    useData({
      options,
      isMulti,
      onChange,
      value,
    })

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          className={cn(
            'flex justify-between max-w-96 pl-3 pr-2 select-none w-full',
            className
          )}
          size="sm"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          // disabled={}
        >
          <div
            className={cn('max-w-72 truncate', {
              'text-muted-foreground': currentValues.length <= 0,
            })}
          >
            {currentValues.length > 0
              ? selectedName
              : placeholder ?? 'Select options'}
          </div>
          <ChevronsUpDown className="h-4 ml-auto opacity-50 shrink-0 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="max-w-52 p-0 w-full"
        align="start"
      >
        <Command loop>
          <CommandInput
            className="select-none"
            placeholder={placeholderSearch ?? 'Placeholder'}
          />
          <CommandListWithScrollArea>
            <CommandEmpty>{emptyText ?? 'No item found'}</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => {
                const hasItem = currentValues.find(
                  (item) => item.value === option.value
                )

                return (
                  <CommandItem
                    value={option.value}
                    onSelect={__onChange}
                    key={option.value}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        hasItem ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="max-w-[10rem] truncate">
                      {option.label}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandListWithScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
