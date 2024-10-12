import type { ConfigEnv, UserConfig } from 'vite'

import { defineConfig, mergeConfig } from 'vite'

import {
  getBuildConfig,
  external,
  pluginHotRestart,
} from './vite.base.config'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'build'>
  const { forgeConfigSelf } = forgeEnv
  const config: UserConfig = {
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        external,
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: forgeConfigSelf.entry,
        output: {
          format: 'cjs',
          // It should not be split chunks.
          inlineDynamicImports: true,
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
        onwarn(warning, warn) {
          // Suppress "Module level directives cause errors when bundled" warnings
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
          }

          warn(warning)
        },
      },
    },
    plugins: [pluginHotRestart('reload')],
  }

  return mergeConfig(getBuildConfig(forgeEnv), config)
})
