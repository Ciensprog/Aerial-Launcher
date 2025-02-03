import { useLanguageStore } from '../state/settings/language'

export function useLanguage() {
  return useLanguageStore()
}

export function useGetAppLanguage() {
  return useLanguageStore((state) => state.language)
}
