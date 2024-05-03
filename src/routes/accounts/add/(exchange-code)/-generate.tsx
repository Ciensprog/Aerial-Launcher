import { Clipboard } from 'lucide-react'

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
            Account selected:{' '}
            <span className="font-bold">
              {selected?.displayName}
              {parseCustomDisplayName(selected)}
            </span>
          </CardDescription>
          <InputSecret
            buttonProps={{
              disabled: generatedCode === null,
              onClick: handleCopyCode,
            }}
            inputProps={{
              placeholder: 'Generated code will be displayed here',
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
            Generate Exchange Code
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
