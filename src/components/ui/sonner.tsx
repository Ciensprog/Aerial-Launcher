import { useTheme } from 'next-themes'
// eslint-disable-next-line import/no-unresolved
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'light' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="flex justify-center text-sm"
      toastOptions={{
        classNames: {
          toast:
            'bg-zinc-50 px-3 py-2 rounded text-muted w-auto max-[600px]:!left-auto max-[600px]:!right-auto max-[600px]:!w-auto',
        },
        duration: 2700,
        unstyled: true,
      }}
      // className="toaster group"
      // toastOptions={{
      //   classNames: {
      //     toast:
      //       'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
      //     description: 'group-[.toast]:text-muted-foreground',
      //     actionButton:
      //       'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
      //     cancelButton:
      //       'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      //   },
      // }}
      {...props}
    />
  )
}

export { Toaster }
