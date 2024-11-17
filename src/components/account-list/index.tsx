import { Check, ChevronsUpDown } from 'lucide-react'

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

import { useCustomizableMenuSettingsVisibility } from '../../hooks/settings'
import { useAccountList } from './hooks'

// import { getStatusProvider } from '../../lib/statuses'
import { cn, parseCustomDisplayName } from '../../lib/utils'

export function AccountList() {
  const {
    accounts,
    createKeywords,
    customFilter,
    onSelect,
    open,
    selected,
    setOpen,
  } = useAccountList()
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          className={cn(
            'not-draggable-region flex justify-between pl-3 pr-2 select-none text-left w-52',
            {
              'justify-center px-0': accounts.length < 1,
            }
          )}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={accounts.length < 1}
        >
          {accounts.length > 0 ? (
            <>
              {selected ? (
                <span className="block w-full">
                  <span className="block truncate max-w-[10rem] w-full">
                    {parseCustomDisplayName(selected)}
                  </span>
                  {/* <span className="block text-muted-foreground text-xs truncate">
                    {getStatusProvider(selected.provider)}
                  </span> */}
                </span>
              ) : (
                'Select account...'
              )}
              <ChevronsUpDown className="h-4 ml-auto opacity-50 shrink-0 w-4" />
            </>
          ) : (
            <span>No accounts registered yet</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-52">
        <Command
          filter={customFilter}
          loop
        >
          {accounts.length > 1 && (
            <CommandInput
              placeholder={
                getMenuOptionVisibility('showTotalAccounts')
                  ? `Search on ${accounts.length} accounts...`
                  : 'Search on your accounts'
              }
              className="select-none"
              disabled={accounts.length <= 1}
            />
          )}
          <CommandListWithScrollArea>
            <CommandEmpty>No account found</CommandEmpty>
            <CommandGroup>
              {accounts.map((account) => {
                const displayName = parseCustomDisplayName(account)

                return (
                  <CommandItem
                    key={account.accountId}
                    value={account.accountId}
                    keywords={createKeywords(account)}
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
                    <div title={displayName}>
                      <div className="max-w-[10rem] truncate">
                        {displayName}
                      </div>
                      {/* <div className="text-muted-foreground text-xs">
                        {getStatusProvider(account.provider)}
                      </div> */}
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
