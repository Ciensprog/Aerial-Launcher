import { images } from '../images'

export function assets(path: string) {
  return images[path.replace(/\.[^/.]+$/, '')] ?? undefined
}
