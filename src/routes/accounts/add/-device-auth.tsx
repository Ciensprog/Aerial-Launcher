import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'

export function DeviceAuthPage() {
  return (
    <Card className="max-w-sm w-full">
      <CardContent className="grid gap-4 pt-6">
        <div className="grid gap-2">
          <Label htmlFor="accountId">Account Id</Label>
          <Input
            type="accountId"
            id="accountId"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="deviceId">Device Id</Label>
          <Input
            type="deviceId"
            id="deviceId"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="secret">Secret</Label>
          <Input
            type="secret"
            id="secret"
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
