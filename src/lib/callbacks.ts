import type { MouseEvent } from 'react'

export function whatIsThis<HTMLElement = 'a'>() {
  return (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = event.currentTarget as any
    const element = target as HTMLAnchorElement
    const href = element.getAttribute('href')

    if (href === '/stw-operations/automation') {
      const link = ['htt', 'ps://y', 'out', 'u', '.be', '/5D3', 'crqpClPY']

      window.electronAPI.openExternalURL(link.join(''))

      return
    }

    const active = Math.random() >= 0.75

    if (!active) {
      return
    }

    const link = [
      'htt',
      'ps://',
      'open.spotify.com',
      '/track/',
      '77Ut',
      'rgTAC',
      'iQ5z',
      'iErPh7',
      'fKe',
    ]

    window.electronAPI.openExternalURL(link.join(''))
  }
}
