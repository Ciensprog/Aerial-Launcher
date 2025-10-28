import { useTheme } from 'next-themes'
// eslint-disable-next-line import/no-unresolved
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const SonnerToaster = ({ ...props }: ToasterProps) => {
  const { theme = 'light' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="flex h-auto justify-center text-sm z-50"
      toastOptions={{
        classNames: {
          toast:
            'bg-zinc-50 border border-muted-foreground/40 px-3 py-2 rounded text-muted w-auto max-[600px]:!left-auto max-[600px]:!right-auto max-[600px]:!w-auto',
        },
        duration: 2700,
        unstyled: true,
      }}
      {...props}
    />
  )
}

export { SonnerToaster }
