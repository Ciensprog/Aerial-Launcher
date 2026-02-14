import { readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const initialPath = './assets/images'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const images: Record<string, any> = {}

function checkPath(currentPath: string) {
  const files = readdirSync(currentPath, {
    withFileTypes: true,
  })

  files.forEach((dirent) => {
    if (dirent.isFile()) {
      images[dirent.name.replace(/\.[^/.]+$/, '')] = path.join(
        currentPath,
        dirent.name,
      )
    } else if (dirent.isDirectory()) {
      checkPath(path.join(currentPath, dirent.name))
    }
  })
}

checkPath(initialPath)

const fileContent = `${Object.entries(images)
  .map(
    ([name, filePath]) =>
      `import ${name.replace(/\s+/g, '-').replace(/-([a-z])/gi, (_match, letter) => letter.toUpperCase())} from '../${filePath.replace(/\\/g, '/')}'`,
  )
  .join('\n')}

export const images: Record<string, string> = {
${Object.entries(images)
  .map(([name]) => {
    const newName =
      name.includes('-') || name.includes(' ') ? `'${name}'` : name

    return `  ${newName}: ${name.replace(/\s+/g, '-').replace(/-([a-z])/gi, (_match, letter) => letter.toUpperCase())},`
  })
  .join('\n')}
}
`

console.log('content:', fileContent)

writeFileSync('./src/images.ts', fileContent)
