import os from 'node:os'
import path from 'node:path'

export function defaultFortniteLogPath() {
  return path.join(
    os.homedir(),
    'AppData',
    'Local',
    'FortniteGame',
    'Saved',
    'Logs',
    'FortniteGame.log',
  )
}

export const FORTNITE_LOG_NAME_RE =
  /^fortnitegame(\d*|_\d+|-\d+)?\.log$/i
