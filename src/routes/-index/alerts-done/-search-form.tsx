import { UpdateIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

import { Combobox } from '../../../components/ui/extended/combobox'
import { SeparatorWithTitle } from '../../../components/ui/extended/separator'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'

import { useInputPaddingButton } from '../../../hooks/ui/inputs'
import { useCustomizableMenuSettingsVisibility } from '../../../hooks/settings'
import { useFormData } from './-hooks'

export function SearchForm() {
  const { t } = useTranslation(['alerts', 'general'])

  const {
    $submitButton,
    accountSelectorIsDisabled,
    formDisabled,
    inputSearch,
    inputSearchButtonIsDisabled,
    options,
    searchIsSubmitting,

    customFilter,
    handleChangeSearchDisplayName,
    handleSearchPlayer,
    onSelectItem,
  } = useFormData()
  const { getMenuOptionVisibility } =
    useCustomizableMenuSettingsVisibility()

  const [$updateInput] = useInputPaddingButton({
    customButtonRef: $submitButton,
  })

  return (
    <div
      className="grid gap-4"
      id="form-alerts-done"
    >
      <div className="space-y-2">
        <Label className="text-muted-foreground text-sm">
          Fetch data from one of your accounts
        </Label>
        <Combobox
          className="max-w-full"
          emptyPlaceholder={t('form.accounts.no-options', {
            ns: 'general',
          })}
          emptyContent={t('form.accounts.search-empty', {
            ns: 'general',
          })}
          placeholder={t('form.accounts.select', {
            ns: 'general',
          })}
          placeholderSearch={t('form.accounts.placeholder', {
            ns: 'general',
            context: !getMenuOptionVisibility('showTotalAccounts')
              ? 'private'
              : undefined,
            total: options.length,
          })}
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
      <SeparatorWithTitle>
        {t('separators.or', {
          ns: 'general',
        })}
      </SeparatorWithTitle>
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
          {t('form.search-account.label', {
            ns: 'general',
          })}
        </Label>
        <div className="flex items-center relative">
          <Input
            placeholder={t('form.search-account.input.placeholder', {
              ns: 'general',
            })}
            className="pr-[var(--pr-button-width)] pl-3 py-1"
            value={inputSearch}
            onChange={handleChangeSearchDisplayName}
            disabled={formDisabled || searchIsSubmitting}
            id="alerts-done-input-search-player"
            ref={$updateInput}
          />
          <Button
            type="submit"
            className="absolute h-8 px-2 py-1.5 right-1 text-sm w-28"
            variant="secondary"
            disabled={formDisabled || inputSearchButtonIsDisabled}
            ref={$submitButton}
          >
            {searchIsSubmitting ? (
              <UpdateIcon className="animate-spin h-4" />
            ) : (
              t('actions.search', {
                ns: 'general',
              })
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
