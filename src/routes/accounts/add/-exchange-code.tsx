import { exampleCode } from '../../../config/constants/examples'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'

export function ExchangeCodePage() {
  return (
    <Card className="max-w-sm w-full">
      <CardContent className="grid gap-4 pt-6">
        <div className="grid gap-2">
          <Label htmlFor="code">Paste Your Code</Label>
          <Input
            type="code"
            placeholder={`Example: ${exampleCode}`}
            id="code"
            required
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Login</Button>
      </CardFooter>
    </Card>
  )
}
