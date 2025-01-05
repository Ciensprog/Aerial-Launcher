import getRandomArrayItem from 'just-random'

import { assets } from '../../../lib/repository'

type EmptyMessage = {
  author?: string
  icon?: string
  probability: number
  success: boolean
  text: string
}

const defaultProbability = 0.1
const emptyMessages: Array<EmptyMessage> = [
  {
    probability: defaultProbability,
    success: true,
    text: 'Skill issue 💀',
  },
  {
    probability: defaultProbability,
    success: true,
    text: 'No hay nada carnal',
  },
  {
    probability: defaultProbability,
    success: true,
    text: 'La c#@%^ va en la taza',
  },
  {
    probability: defaultProbability,
    success: true,
    text: '💀',
  },
  {
    probability: defaultProbability,
    success: true,
    text: 'The s#@%^ goes on the toilet',
  },
  {
    probability: defaultProbability,
    success: true,
    text: 'Meh...',
  },
  {
    author: 'Carl “CJ” Johnson',
    probability: defaultProbability,
    success: true,
    text: 'Ah s#@%^ here we go again...',
  },
  {
    probability: defaultProbability,
    success: true,
    text: 'Ostia tío que no hay nada aquí',
  },
  {
    author: 'Fresh',
    probability: defaultProbability,
    success: true,
    text: 'Ahorita no joven',
  },
  {
    author: 'Fresh',
    probability: defaultProbability,
    success: true,
    text: 'Come back tomorrow',
  },
  {
    author: 'Fist',
    probability: defaultProbability,
    success: true,
    text: 'No hay pavos 🗣️🔥',
  },
  {
    author: 'Fist',
    probability: defaultProbability,
    success: true,
    text: 'No vbucks 4 u 🗣️',
  },
  {
    author: 'Fist',
    probability: defaultProbability,
    success: true,
    text: 'Hoy no hay pavos, mañana sí',
  },
  {
    author: '3D3R',
    probability: defaultProbability,
    success: true,
    text: 'Quien sabe',
  },
]
export const defaultEmptyMessage: EmptyMessage = {
  probability: 1,
  success: false,
  text: 'missions',
}
export const defaultEmptyVBucksMessage: EmptyMessage = {
  icon: assets('images/random/pensive-cowboy.png'),
  probability: 1,
  success: false,
  text: 'vbucks',
}

export function getRandomEmptyMessage(useCustomMessage?: boolean) {
  if (useCustomMessage !== true) {
    return null
  }

  const message = getRandomArrayItem(emptyMessages)

  if (message) {
    const randomNumber = Math.random()
    const result = randomNumber <= message.probability

    if (result) {
      return message
    }
  }

  return useCustomMessage ? defaultEmptyVBucksMessage : null
}
