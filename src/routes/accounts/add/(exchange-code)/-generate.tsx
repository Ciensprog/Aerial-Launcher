import { Clipboard } from 'lucide-react'

import { Button } from '../../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from '../../../../components/ui/card'
import { Input } from '../../../../components/ui/input'

import { useGenerateHandlers } from './-hooks'

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
            <span className="font-bold">{selected?.displayName}</span>
          </CardDescription>
          <div className="flex items-center relative">
            <Input
              placeholder="Generated code will be displayed here"
              value={generatedCode ?? ''}
              disabled
            />
            <Button
              className="absolute p-0 right-1 size-8"
              variant="ghost"
              disabled={generatedCode === null}
              onClick={handleCopyCode}
            >
              <Clipboard size={16} />
            </Button>
          </div>
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
