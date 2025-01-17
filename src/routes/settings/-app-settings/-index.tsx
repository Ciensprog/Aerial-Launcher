import { Card, CardContent } from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { AppSettingsBaseForm } from './-base-form'
import { LanguageSelector } from './-language'

export function AppSettings() {
  return (
    <Card className="w-full">
      <CardContent className="grid pt-6">
        <LanguageSelector />

        <Separator className="my-6" />

        <AppSettingsBaseForm />
      </CardContent>
    </Card>
  )
}
