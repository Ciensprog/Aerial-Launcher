import { AppSettingsBaseForm } from './-base-form'
import { AppsettingsCustomMenu } from './-custom-menu'

export function AppSettings() {
  return (
    <div className="space-y-6">
      <AppSettingsBaseForm />
      <AppsettingsCustomMenu />
    </div>
  )
}
