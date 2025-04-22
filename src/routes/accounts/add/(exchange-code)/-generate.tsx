import { Clipboard } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { InputSecret } from '../../../../components/ui/extended/form/input-secret'
import { Button } from '../../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from '../../../../components/ui/card'

import { useGenerateHandlers } from './-hooks'

import { parseCustomDisplayName } from '../../../../lib/utils'

export function GenerateExchangeCodePage() {
  const { t } = useTranslation(['accounts'], {
    keyPrefix: 'exchange-code.form.generate-code',
  })

  const {
    generatedCode,
    selected,
    handleCopyCode,
    handleGenerateExchange,
  } = useGenerateHandlers()

  return (
    <>
      <Card className="max-w-sm w-full">
        <CardContent className="grid gap-4 pt-6">
          <CardDescription>
            <Trans
              ns="general"
              i18nKey="account-selected"
              values={{
                name: parseCustomDisplayName(selected),
              }}
            >
              Account selected:{' '}
              <span className="font-bold">
                {parseCustomDisplayName(selected)}
              </span>
            </Trans>
          </CardDescription>
          <InputSecret
            buttonProps={{
              disabled: generatedCode === null,
              onClick: handleCopyCode,
            }}
            inputProps={{
              placeholder: t('input.placeholder'),
              value: generatedCode ?? '',
              disabled: true,
            }}
            iconButton={<Clipboard size={16} />}
          />
        </CardContent>
        <CardFooter className="space-x-6">
          <Button
            className="w-full"
            onClick={handleGenerateExchange}
          >
            {t('submit-button')}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
