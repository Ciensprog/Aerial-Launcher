import { Link, createRoute } from '@tanstack/react-router'
import { UpdateIcon } from '@radix-ui/react-icons'

import { Route as RootRoute } from '../../__root'

import { InputTags } from '../../../components/ui/third-party/extended/input-tags'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '../../../components/ui/card'

import { useData } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/save-quests',
  component: () => {
    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>STW Operations</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Save Quests</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const {
    accounts,
    areThereAccounts,
    isLoading,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    handleSave,
    saveQuestsUpdateAccounts,
    saveQuestsUpdateTags,
  } = useData()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <Card className="max-w-lg w-full">
          <CardHeader className="border-b">
            <CardDescription>
              Save quests progression of the selected accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-4">
              <InputTags
                placeholder="Select some accounts..."
                options={accounts}
                value={parsedSelectedAccounts}
                onChange={saveQuestsUpdateAccounts}
              />
              <InputTags
                placeholder="Select some tags..."
                options={tags}
                value={parsedSelectedTags}
                onChange={saveQuestsUpdateTags}
              />
            </div>
          </CardContent>
          <CardFooter className="space-x-6">
            <Button
              className="disabled:cursor-not-allowed disabled:pointer-events-auto disabled:select-none w-full"
              onClick={handleSave}
              disabled={isSelectedEmpty || isLoading || !areThereAccounts}
            >
              {isLoading ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                'Save Quests'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
