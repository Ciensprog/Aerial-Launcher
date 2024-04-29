import type { ReactNode } from 'react'
import type { ButtonProps } from '../../button'
import type { InputProps } from '../../input'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../button'
import { Input } from '../../input'

import { cn } from '../../../../lib/utils'

type Props = {
  buttonProps?: ButtonProps
  inputProps?: InputProps
  iconButton?: ReactNode
}

export function InputSecret({
  buttonProps,
  iconButton,
  inputProps,
}: Props) {
  const [isSecret, setIsSecret] = useState(true)
  const icon = isSecret ? <Eye size={16} /> : <EyeOff size={16} />

  return (
    <div
      className={cn(
        'flex items-center overflow-hidden relative rounded-md'
      )}
    >
      <Input
        {...inputProps}
        className={cn('pr-10 select-none', inputProps?.className)}
        type={isSecret ? 'password' : 'text'}
      />
      <Button
        variant="ghost"
        type="button"
        onClick={() => setIsSecret(!isSecret)}
        {...buttonProps}
        className={cn(
          'absolute p-0 right-1 size-8 z-20',
          buttonProps?.className
        )}
      >
        {iconButton ? iconButton : icon}
      </Button>
    </div>
  )
}
