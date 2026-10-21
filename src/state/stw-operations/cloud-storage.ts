import type {
  CloudStorageApplyAccountResult,
  CloudStorageDownloadResult,
  CloudStorageFileInfo,
  CloudStorageLocalFile,
} from '../../types/cloud-storage'

import { create } from 'zustand'

export type CloudStorageState = {
  sourceAccountId: string | null
  accounts: Array<string>
  tags: Array<string>
  files: Array<CloudStorageFileInfo>
  selectedFilenames: Array<string>
  localFiles: Array<CloudStorageLocalFile>
  listed: boolean
  isListing: boolean
  isDownloading: boolean
  isPicking: boolean
  isApplying: boolean
  listError: string | null
  downloadResult: CloudStorageDownloadResult | null
  applyResults: Array<CloudStorageApplyAccountResult>

  setSourceAccountId: (accountId: string | null) => void
  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  setFiles: (files: Array<CloudStorageFileInfo>) => void
  setListed: (listed: boolean) => void
  setSelectedFilenames: (filenames: Array<string>) => void
  toggleFilename: (filename: string) => void
  setLocalFiles: (files: Array<CloudStorageLocalFile>) => void
  addLocalFiles: (files: Array<CloudStorageLocalFile>) => void
  removeLocalFile: (filePath: string) => void
  setListing: (isListing: boolean) => void
  setDownloading: (isDownloading: boolean) => void
  setPicking: (isPicking: boolean) => void
  setApplying: (isApplying: boolean) => void
  setListError: (listError: string | null) => void
  setDownloadResult: (value: CloudStorageDownloadResult | null) => void
  setApplyResults: (value: Array<CloudStorageApplyAccountResult>) => void
}

export const useCloudStorageStore = create<CloudStorageState>()((set) => ({
  sourceAccountId: null,
  accounts: [],
  tags: [],
  files: [],
  selectedFilenames: [],
  localFiles: [],
  listed: false,
  isListing: false,
  isDownloading: false,
  isPicking: false,
  isApplying: false,
  listError: null,
  downloadResult: null,
  applyResults: [],

  setSourceAccountId: (sourceAccountId) =>
    set({
      sourceAccountId,
      files: [],
      selectedFilenames: [],
      listError: null,
      listed: false,
    }),
  updateAccounts: (accountIds) =>
    set({
      accounts: [...new Set(accountIds)],
    }),
  updateTags: (tags) =>
    set({
      tags: [...new Set(tags)],
    }),
  setFiles: (files) => set({ files }),
  setListed: (listed) => set({ listed }),
  setSelectedFilenames: (selectedFilenames) =>
    set({
      selectedFilenames: [...new Set(selectedFilenames)],
    }),
  toggleFilename: (filename) =>
    set((state) => ({
      selectedFilenames: state.selectedFilenames.includes(filename)
        ? state.selectedFilenames.filter((item) => item !== filename)
        : [...state.selectedFilenames, filename],
    })),
  setLocalFiles: (localFiles) => set({ localFiles }),
  addLocalFiles: (files) =>
    set((state) => {
      const incoming = new Set(files.map((file) => file.path))
      const kept = state.localFiles.filter(
        (file) => !incoming.has(file.path),
      )

      return {
        localFiles: [...kept, ...files],
      }
    }),
  removeLocalFile: (filePath) =>
    set((state) => ({
      localFiles: state.localFiles.filter((file) => file.path !== filePath),
    })),
  setListing: (isListing) => set({ isListing }),
  setDownloading: (isDownloading) => set({ isDownloading }),
  setPicking: (isPicking) => set({ isPicking }),
  setApplying: (isApplying) => set({ isApplying }),
  setListError: (listError) => set({ listError }),
  setDownloadResult: (downloadResult) => set({ downloadResult }),
  setApplyResults: (applyResults) => set({ applyResults }),
}))
