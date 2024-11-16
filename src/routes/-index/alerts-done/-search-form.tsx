import { UpdateIcon } from '@radix-ui/react-icons'

import { Combobox } from '../../../components/ui/extended/combobox'
import { SeparatorWithTitle } from '../../../components/ui/extended/separator'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'

import { useFormData } from './-hooks'

export function SearchForm() {
  const {
    $submitButton,
    accountSelectorIsDisabled,
    inputSearch,
    inputSearchButtonIsDisabled,
    options,
    searchIsSubmitting,

    customFilter,
    handleChangeSearchDisplayName,
    handleSearchPlayer,
    onSelectItem,
  } = useFormData()

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label className="text-muted-foreground text-sm">
          Fetch data from one of your accounts
        </Label>
        <Combobox
          className="max-w-full"
          emptyPlaceholder="No accounts"
          emptyContent="No account found"
          placeholder="Select an account"
          placeholderSearch={`Search on ${options.length} accounts`}
          options={options}
          value={[]}
          customFilter={customFilter}
          onChange={() => {}}
          onSelectItem={onSelectItem}
          emptyContentClassname="py-6 text-center text-sm"
          disabled={accountSelectorIsDisabled}
          disabledItem={accountSelectorIsDisabled}
          inputSearchIsDisabled={accountSelectorIsDisabled}
          hideInputSearchWhenOnlyOneOptionIsAvailable
          hideSelectorOnSelectItem
        />
      </div>
      <SeparatorWithTitle>Or</SeparatorWithTitle>
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault()

          if (!inputSearchButtonIsDisabled) {
            handleSearchPlayer()
          }
        }}
      >
        <Label
          className="text-muted-foreground"
          htmlFor="alerts-done-input-search-player"
        >
          Search player by accountId or display name (epic, xbl or psn)
        </Label>
        <div className="flex items-center relative">
          <Input
            placeholder="Example: Sample"
            className="pr-32 pl-3 py-1"
            value={inputSearch}
            onChange={handleChangeSearchDisplayName}
            disabled={searchIsSubmitting}
            id="alerts-done-input-search-player"
          />
          <Button
            type="submit"
            className="absolute h-8 px-2 py-1.5 right-1 text-sm w-28"
            variant="secondary"
            disabled={inputSearchButtonIsDisabled}
            ref={$submitButton}
          >
            {searchIsSubmitting ? (
              <UpdateIcon className="animate-spin h-4" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
