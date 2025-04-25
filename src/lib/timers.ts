export async function sleep(time: number) {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time * 1000)
  })
}
