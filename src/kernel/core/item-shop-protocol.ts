import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { protocol } from 'electron'

import { DataDirectory } from '../startup/data-directory'

import { fortniteApiService } from '../../services/config/fortnite-api'

const MAX_DOWNLOADS = 2

const waiting: Array<() => void> = []
let running = 0

function pump() {
  while (running < MAX_DOWNLOADS && waiting.length > 0) {
    const next = waiting.shift()

    if (!next) {
      return
    }

    running += 1
    next()
  }
}

function enqueue<T>(task: () => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      task()
        .then(resolve, reject)
        .finally(() => {
          running = Math.max(0, running - 1)
          pump()
        })
    }

    waiting.push(run)
    pump()
  })
}

function iconsDir() {
  return path.join(DataDirectory.rootPath, 'item-shop', 'icons')
}

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
}

export function registerItemShopScheme() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'itemshop',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        bypassCSP: true,
        stream: true,
      },
    },
  ])
}

async function loadIcon(id: string) {
  const filePath = path.join(iconsDir(), `${id}.png`)

  try {
    const cached = await readFile(filePath)

    return new Response(new Uint8Array(cached), {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=86400',
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    //
  }

  const paths = [
    `/images/cosmetics/br/${id}/smallicon.png`,
    `/images/cosmetics/br/${id}/icon.png`,
  ]

  for (const imagePath of paths) {
    try {
      const response = await fortniteApiService.get<ArrayBuffer>(imagePath, {
        responseType: 'arraybuffer',
        timeout: 8000,
      })
      const bytes = Buffer.from(response.data)

      await mkdir(iconsDir(), { recursive: true })
      await writeFile(filePath, bytes)

      return new Response(new Uint8Array(bytes), {
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=86400',
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }
  }

  return new Response('not found', { status: 404 })
}

export function registerItemShopProtocol() {
  protocol.handle('itemshop', async (request) => {
    const url = new URL(request.url)
    const id = safeId(decodeURIComponent(url.pathname.replace(/^\//, '')))

    if (!id) {
      return new Response('missing id', { status: 400 })
    }

    return enqueue(() => loadIcon(id))
  })
}

export function itemShopIconUrl(cosmeticId: string) {
  const id = safeId(cosmeticId)

  if (!id) {
    return null
  }

  return `itemshop://icon/${id}`
}
