declare global {
  interface Window {
    electronAPI: Window['electronAPI'] & {
      misjeGetConfig: () => Promise<{
        outputDir: string
        customFilePath: string
        yesterdayFilePath: string
        extraPresets: Array<string>
        displayNameValue: string
      }>
      misjeSaveConfig: (config: {
        outputDir?: string
        customFilePath?: string
        yesterdayFilePath?: string
        extraPresets?: Array<string>
        displayNameValue?: string
      }) => Promise<void>
      misjeFetchPreset: (options: unknown) => Promise<unknown>
      misjeSaveFile: (targetPath: string, data: unknown) => Promise<string>
      misjePickDir: () => Promise<string | null>
      misjePickFile: () => Promise<string | null>
      misjePickSaveFile: (defaultPath?: string) => Promise<string | null>
      misjeReadFile: (filePath: string) => Promise<unknown>
    }
  }
}

export {}