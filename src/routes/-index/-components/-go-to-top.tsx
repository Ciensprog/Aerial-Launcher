import { Button } from '../../../components/ui/button'

import { useScrollToTop } from '../-hooks'

import { cn } from '../../../lib/utils'

export function GoToTop() {
  const { scrollToTopButtonIsVisible, scrollButtonOnClick } =
    useScrollToTop()

  return (
    <Button
      className={cn(
        'bottom-5 fixed opacity-0 px-4 right-5 transition-all translate-x-28 z-10',
        {
          'opacity-100 translate-x-0': scrollToTopButtonIsVisible,
        }
      )}
      size="sm"
      variant="secondary"
      onClick={scrollButtonOnClick}
    >
      Go To Top
    </Button>
  )
}
