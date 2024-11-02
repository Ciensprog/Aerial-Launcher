import { Separator } from '../../../components/ui/separator'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { TagItem } from './-item'

import { useFormCreate, useGetFilteredTags } from './-hooks'

export function TagsManagement() {
  const { filteredTags, onChangeSearchValue, searchValue, tagsArray } =
    useGetFilteredTags()
  const {
    currentTag,
    isSubmittingTag,
    onChangeInputTagValue,
    onSubmitTag,
  } = useFormCreate()

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardDescription>
          You can create tags to group accounts easily and run bulk
          operations in a more organized way.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6">
          <form
            className="flex items-center relative rounded-md"
            onSubmit={onSubmitTag}
          >
            <Input
              className="pr-[4.5rem]"
              placeholder="Type a tag name"
              value={currentTag}
              onChange={onChangeInputTagValue}
              disabled={isSubmittingTag}
            />
            <Button
              type="submit"
              variant="secondary"
              className="absolute h-8 px-2 right-1 w-auto"
              disabled={isSubmittingTag || currentTag.trim() === ''}
            >
              Create
            </Button>
          </form>
        </div>
        {tagsArray.length > 0 && (
          <>
            <Separator />

            <div className="grid gap-4 p-6 pr-3">
              {tagsArray.length > 1 && (
                <div className="mb-5">
                  <Input
                    className="pr-20"
                    placeholder={`Search on ${tagsArray.length} tags...`}
                    value={searchValue}
                    onChange={onChangeSearchValue}
                  />
                </div>
              )}

              {filteredTags.length > 0 ? (
                filteredTags.map(([name, color]) => (
                  <TagItem
                    data={{
                      color,
                      name,
                    }}
                    key={name}
                  />
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No tag found
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
