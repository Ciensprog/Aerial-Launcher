import { Collection } from '@discordjs/collection'

export type Item = {
  accountId: string
  displayName: string
  antiCheat: string
}

const antiCheats = ['BattlEye', 'EasyAntiCheatEOS']

export const accounts = new Collection<string, Item>(
  Array.from<string, [string, Item]>(Array(2), (_, index) => {
    const antiCheatSelected = antiCheats[Math.random() >= 0.5 ? 1 : 0]

    return [
      `a0b1c2d3e4f5g6h7i8j9k-${index}`,
      {
        accountId: `a0b1c2d3e4f5g6h7i8j9k-${index}`,
        displayName: `Display Name #${index + 1}`,
        antiCheat: antiCheatSelected,
      },
    ]
  })
)
