import { useTranslation } from 'react-i18next'

import { availableLanguages } from '../../../config/constants/settings'
import { Language } from '../../../locales/resources'

import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'

import { useLanguage } from '../../../hooks/language'

import { changeDateLocale } from '../../../lib/dates'

export function LanguageSelector() {
  const { i18n, t } = useTranslation(['settings', 'general'])

  const { language, updateLanguage } = useLanguage()

  return (
    <div>
      <Label htmlFor="app-settings-language">
        {t('app-settings.form.language.label')}
      </Label>
      <Select
        onValueChange={(language: Language) => {
          window.electronAPI.changeAppLanguage(language)
          updateLanguage(language)
          i18n.changeLanguage(language)
          changeDateLocale(language)
        }}
        value={language ?? undefined}
      >
        <SelectTrigger
          className="mt-2"
          id="app-settings-language"
        >
          <SelectValue
            placeholder={t('app-settings.form.language.input.placeholder')}
          />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((language) => (
            <SelectItem
              value={language.id}
              key={language.id}
            >
              {language.title}
              {language.completed === false
                ? ` ${t('under-translation', {
                    ns: 'general',
                  })}`
                : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
