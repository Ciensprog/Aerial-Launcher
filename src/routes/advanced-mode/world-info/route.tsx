import { UpdateIcon } from '@radix-ui/react-icons'
import { Link, createRoute } from '@tanstack/react-router'
import {
  CloudDownload,
  FileJson,
  FileSearch2,
  FileWarning,
  Save,
  Share,
  Trash2,
} from 'lucide-react'

import { Route as RootRoute } from '../../__root'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'

import { useCurrentActions, useData } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/advanced-mode/world-info',
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
              <BreadcrumbPage>Advanced Mode</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>World Info</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Content />
      </>
    )
  },
})

const files = [
  '2024-01-01',
  '2024-01-02',
  '2024-01-03',
  '2024-01-04',
  '2024-01-05',
]

function Content() {
  const { currentData, isFetching, isSaving } = useData()
  const { handleRefetch, handleSave } = useCurrentActions()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <div className="max-w-lg w-full">
          <div className="border flex mb-10 mt-5 mx-auto rounded w-80">
            <div className="bg-muted-foreground/5 flex flex-col justify-center py-4 w-1/2">
              <div className="flex flex-shrink-0 justify-center mb-2 pl-2 pr-3">
                {!isFetching && currentData.value ? (
                  <FileJson
                    className="stroke-muted-foreground"
                    size={32}
                  />
                ) : isFetching ? (
                  <FileSearch2
                    className="stroke-muted-foreground"
                    size={32}
                  />
                ) : (
                  <FileWarning
                    className="stroke-muted-foreground"
                    size={32}
                  />
                )}
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">
                  {currentData.value ? currentData.date : 'N/A'}
                </div>
                <div className="font-medium text-muted-foreground text-xs uppercase">
                  Current
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-center p-2 w-1/2">
              <Button
                type="button"
                className="gap-1 h-auto px-0 py-2 text-xs"
                onClick={handleSave(currentData.date)}
                disabled={isFetching || !currentData.value || isSaving}
              >
                {isSaving ? (
                  <UpdateIcon className="animate-spin h-4" />
                ) : (
                  <>
                    <Save size={16} />
                    Save On Local
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="gap-1 h-auto px-0 py-2 text-xs"
                onClick={handleRefetch}
                disabled={isFetching || isSaving}
              >
                {isFetching ? (
                  <UpdateIcon className="animate-spin h-4" />
                ) : (
                  <>
                    <CloudDownload size={16} />
                    Refetch data
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mb-5">
            {files.length > 0 ? (
              <>
                {files.length > 1 && (
                  <div className="mb-5">
                    <Input
                      placeholder={`Search on ${files.length} files`}
                    />
                  </div>
                )}

                <div className="gap-2 grid grid-cols-1">
                  {files.toReversed().map((date) => (
                    <Item
                      data={{
                        date,
                      }}
                      key={date}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-20 text-center text-muted-foreground">
                <FileWarning
                  size={48}
                  className="mx-auto"
                />
                <div className="mt-2">No files found</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Item({
  data,
}: {
  data: {
    date: string
  }
}) {
  return (
    <Card className="border-none-">
      <CardContent className="flex items-center px-2 py-2">
        <div className="flex-shrink-0 pl-2 pr-3">
          <FileJson
            className="stroke-muted-foreground"
            size={24}
          />
        </div>
        <div className="flex flex-grow items-center relative">
          <Input
            className="border-none- h-auto pr-20 pl-3  py-1"
            placeholder={`Default name: ${data.date}`}
          />
          <Button
            type="button"
            variant="secondary"
            className="absolute h-auto px-2 py-0.5 right-1 text-sm"
          >
            Update
          </Button>
        </div>
      </CardContent>
      <CardFooter className="bg-muted-foreground/5 px-2 py-1 rounded-b">
        <div className="">
          <span className="flex-shrink-0 px-1.5- py-0.5 rounded text-muted-foreground text-sm">
            Date: {data.date}
          </span>
        </div>
        <div className="flex ml-auto">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="flex flex-shrink-0 justify-center size-8"
          >
            <Share size={16} />
            <span className="sr-only">export file</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="flex flex-shrink-0 justify-center size-8 text-[#ff6868]/60 hover:text-[#ff6868]"
          >
            <Trash2 size={16} />
            <span className="sr-only">remove file</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
