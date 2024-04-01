import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react'

import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandListWithScrollArea,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'

import { useAccountList } from './hooks'

import { getStatusProvider } from '../../lib/statuses'
import { cn } from '../../lib/utils'

export function AccountList() {
  const { accounts, onSelect, open, selected, setOpen } = useAccountList()

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          className="flex justify-between select-none text-left w-52"
          size="lg"
          variant="outline"
          role="combobox"
          aria-expanded={open}
        >
          {selected ? (
            <span className="block w-full">
              <span className="block truncate w-full">
                {selected.displayName}
              </span>
              <span className="block text-muted-foreground text-xs truncate">
                {getStatusProvider(selected.provider)}
              </span>
            </span>
          ) : (
            'Select account...'
          )}
          <ChevronsUpDown className="h-4 ml-auto opacity-50 shrink-0 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-52">
        {accounts.length > 0 ? (
          <>
            <Command>
              {accounts.length > 1 && (
                <CommandInput
                  placeholder={`Search on ${accounts.length} accounts...`}
                  className="select-none"
                  disabled={accounts.length <= 1}
                />
              )}
              <CommandListWithScrollArea>
                <CommandEmpty>No account found</CommandEmpty>
                <CommandGroup>
                  {accounts.map((account) => (
                    <CommandItem
                      key={account.accountId}
                      value={account.displayName}
                      onSelect={onSelect(account)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selected?.accountId === account.accountId
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className="">
                        <div className="">{account.displayName}</div>
                        <div className="text-muted-foreground text-xs">
                          {getStatusProvider(account.provider)}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandListWithScrollArea>
              <Separator />
            </Command>
          </>
        ) : null}
        <div className="p-1">
          <Button
            className="w-full"
            size="sm"
            variant="ghost"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Account
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
