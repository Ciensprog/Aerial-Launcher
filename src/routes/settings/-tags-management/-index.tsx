import { useTranslation } from 'react-i18next'

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

import { useInputPaddingButton } from '../../../hooks/ui/inputs'
import { useFormCreate, useGetFilteredTags } from './-hooks'

export function TagsManagement() {
  const { t } = useTranslation(['settings', 'general'])

  const { filteredTags, onChangeSearchValue, searchValue, tagsArray } =
    useGetFilteredTags()
  const {
    currentTag,
    isSubmittingTag,
    onChangeInputTagValue,
    onSubmitTag,
  } = useFormCreate()
  const [$createInput, $createButton] = useInputPaddingButton()

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardDescription>
          {t('tags-management.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6">
          <form
            className="flex items-center relative rounded-md"
            onSubmit={onSubmitTag}
          >
            <Input
              className="pr-[var(--pr-button-width)]"
              placeholder={t('tags-management.form.input.placeholder')}
              value={currentTag}
              onChange={onChangeInputTagValue}
              disabled={isSubmittingTag}
              ref={$createInput}
            />
            <Button
              type="submit"
              variant="secondary"
              className="absolute h-8 px-2 right-1 w-auto"
              disabled={isSubmittingTag || currentTag.trim() === ''}
              ref={$createButton}
            >
              {t('general:actions.create')}
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
                    placeholder={t(
                      'tags-management.search.input.placeholder',
                      {
                        total: tagsArray.length,
                      }
                    )}
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
                  {t('tags-management.search.empty')}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
