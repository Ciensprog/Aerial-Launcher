import { useTranslation } from 'react-i18next'
import { memo, useState } from 'react'

import {
  availableLanguages,
  defaultAppLanguage,
} from '../config/constants/settings'
import { Language } from '../locales/resources'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'

import { useLanguage } from '../hooks/language'

import { changeDateLocale } from '../lib/dates'
import { cn } from '../lib/utils'

export const LanguageNotification = memo(() => {
  const { i18n, t } = useTranslation(['settings', 'general'])

  const [selected, setSelected] = useState<Language>()

  const { language: currentLanguage, updateLanguage } = useLanguage()

  if (currentLanguage !== null) {
    return null
  }

  const handleConfirmSelection = () => {
    if (!selected) {
      return
    }

    window.electronAPI.changeAppLanguage(selected)
    updateLanguage(selected)
    i18n.changeLanguage(selected)
    changeDateLocale(selected)
  }

  return (
    <Dialog defaultOpen>
      <DialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            {t('app-settings.form.language.dialog.title')}
          </DialogTitle>
        </DialogHeader>

        <ul className="border-l-8- list-disc pl-6 py-1 text-muted-foreground">
          <li className="">
            {t('app-settings.form.language.dialog.notes.1')}
          </li>
          <li className="">
            {t('app-settings.form.language.dialog.notes.2')}
          </li>
        </ul>

        <RadioGroup
          className={cn('grid grid-cols-2 gap-4')}
          onValueChange={(value: Language) => setSelected(value)}
          value={selected}
        >
          {availableLanguages.map((language) => (
            <div
              className={cn(
                'border flex items-center justify-center px-2 py-3 relative ring-offset-background rounded space-x-2',
                'has-[[data-state=checked]]:bg-primary has-[[data-state=checked]]:text-secondary',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2'
              )}
              key={language.id}
            >
              <RadioGroupItem
                className="absolute border-none h-full opacity-0 rounded-none w-full"
                value={language.id}
                id={`language-option-${language.id}`}
                autoFocus={language.id === defaultAppLanguage}
              />
              <Label htmlFor={`language-option-${language.id}`}>
                {language.title}
                {language.completed === false
                  ? ` ${t('under-translation', {
                      ns: 'general',
                    })}`
                  : ''}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button
          variant="secondary"
          onClick={handleConfirmSelection}
          disabled={!selected}
        >
          {t('app-settings.form.language.dialog.submit-button')}
        </Button>
      </DialogContent>
    </Dialog>
  )
})
