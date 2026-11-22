import type { ForgeConfig } from '@electron-forge/shared-types'

import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { VitePlugin } from '@electron-forge/plugin-vite'
import { FuseV1Options, FuseVersion } from '@electron/fuses'

import packageJson from './package.json'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: 'icon-transparent.ico',
    // Forge 8 dropped the Vite plugin's automatic dependency copy and
    // its filter only lets /.vite through. Main deps are still
    // externalized in vite.base.config.ts (node-process-watcher is
    // native), so we widen the filter to node_modules.
    ignore: (file) => {
      if (!file) return false
      if (file.startsWith('/node_modules/.vite')) return true
      return !file.startsWith('/.vite') && !file.startsWith('/node_modules')
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      iconUrl: `https://raw.githubusercontent.com/${packageJson.author.name}/Aerial-Launcher/main/icon-transparent.ico`,
      setupIcon: 'icon-transparent.ico',
    }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/kernel/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/kernel/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        draft: true,
        generateReleaseNotes: true,
        prerelease: false,
        repository: {
          owner: packageJson.author.name,
          name: packageJson.name,
        },
      },
    },
  ],
}

export default config
