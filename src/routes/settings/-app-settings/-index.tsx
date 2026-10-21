import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { SeparatorWithTitle } from '../../../components/ui/extended/separator'
import { AppSettingsBaseForm } from './-base-form'
import { LanguageSelector } from './-language'
import { SwapFileSettings } from '../-swap-file'

export function AppSettings() {
  const { t } = useTranslation(['settings'])

  return (
    <Card className="w-full">
      <CardContent className="grid pt-6">
        <LanguageSelector />

        <SeparatorWithTitle className="my-6">
          {t('swap-file.title')}
        </SeparatorWithTitle>

        <SwapFileSettings />

        <Separator className="my-6" />

        <AppSettingsBaseForm />
      </CardContent>
    </Card>
  )
}
