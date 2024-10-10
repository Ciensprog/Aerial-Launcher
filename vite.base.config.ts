import type { AddressInfo } from 'node:net'
import type { ConfigEnv, Plugin, UserConfig } from 'vite'

import { builtinModules } from 'node:module'
import path from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'

import packageJson from './package.json'

export const builtins = [
  'electron',
  ...builtinModules.map((m) => [m, `node:${m}`]).flat(),
]

export const external = [
  ...builtins,
  ...Object.keys(
    'dependencies' in packageJson
      ? (packageJson.dependencies as Record<string, unknown>)
      : {}
  ),
]

export function getBuildConfig(env: ConfigEnv<'build'>): UserConfig {
  const { root, mode, command } = env

  return {
    root,
    mode,
    build: {
      chunkSizeWarningLimit: 2000,
      // Prevent multiple builds from interfering with each other.
      emptyOutDir: false,
      // 🚧 Multiple builds may conflict.
      outDir: '.vite/build',
      watch: command === 'serve' ? {} : null,
      minify: command === 'build',
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress "Module level directives cause errors when bundled" warnings
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
          }

          warn(warning)
        },
      },
    },
    clearScreen: false,
    plugins: [TanStackRouterVite(), react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
}

export function getDefineKeys(names: string[]) {
  const define: { [name: string]: VitePluginRuntimeKeys } = {}

  return names.reduce((acc, name) => {
    const NAME = name.toUpperCase()
    const keys: VitePluginRuntimeKeys = {
      VITE_DEV_SERVER_URL: `${NAME}_VITE_DEV_SERVER_URL`,
      VITE_NAME: `${NAME}_VITE_NAME`,
    }

    return { ...acc, [name]: keys }
  }, define)
}

export function getBuildDefine(env: ConfigEnv<'build'>) {
  const { command, forgeConfig } = env
  const names = forgeConfig.renderer
    .filter(({ name }) => Boolean(name))
    .map(({ name }) => name) as Array<string>
  const defineKeys = getDefineKeys(names)
  const define = Object.entries(defineKeys).reduce(
    (acc, [name, keys]) => {
      const { VITE_DEV_SERVER_URL, VITE_NAME } = keys
      const def = {
        [VITE_DEV_SERVER_URL]:
          command === 'serve'
            ? JSON.stringify(process.env[VITE_DEV_SERVER_URL])
            : undefined,
        [VITE_NAME]: JSON.stringify(name),
      }
      return { ...acc, ...def }
    },
    {} as Record<string, unknown>
  )

  return define
}

export function pluginExposeRenderer(name: string): Plugin {
  const { VITE_DEV_SERVER_URL } = getDefineKeys([name])[name]

  return {
    name: '@electron-forge/plugin-vite:expose-renderer',
    configureServer(server) {
      process.viteDevServers ??= {}
      // Expose server for preload scripts hot reload.
      process.viteDevServers[name] = server

      server.httpServer?.once('listening', () => {
        const addressInfo = server.httpServer?.address() as AddressInfo
        // Expose env constant for main process use.
        process.env[VITE_DEV_SERVER_URL] =
          `http://localhost:${addressInfo?.port}`
      })
    },
  }
}

export function pluginHotRestart(command: 'reload' | 'restart'): Plugin {
  return {
    name: '@electron-forge/plugin-vite:hot-restart',
    closeBundle() {
      if (command === 'reload') {
        for (const server of Object.values(process.viteDevServers)) {
          // Preload scripts hot reload.
          server.ws.send({ type: 'full-reload' })
        }
      } else {
        // Main process hot restart.
        // https://github.com/electron/forge/blob/v7.2.0/packages/api/core/src/api/start.ts#L216-L223
        process.stdin.emit('data', 'rs')
      }
    },
  }
}
