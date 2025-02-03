import getRandomArrayItem from 'just-random'

import { assets } from '../../../lib/repository'

type EmptyMessage = {
  author?: string
  icon?: string
  probability: number
  isDefault?: boolean
  text: string
}

const defaultProbability = 0.01
const emptyMessages: Array<EmptyMessage> = [
  {
    probability: defaultProbability,
    text: 'Skill issue 💀',
  },
  {
    probability: defaultProbability,
    text: 'No hay nada carnal',
  },
  {
    probability: defaultProbability,
    text: 'La c#@%^ va en la taza',
  },
  {
    probability: defaultProbability,
    text: '💀',
  },
  {
    probability: defaultProbability,
    text: 'The s#@%^ goes on the toilet',
  },
  {
    probability: defaultProbability,
    text: 'Meh...',
  },
  {
    author: 'Carl “CJ” Johnson',
    probability: defaultProbability,
    text: 'Ah s#@%^ here we go again...',
  },
  {
    probability: defaultProbability,
    text: 'Ostia tío que no hay nada aquí',
  },
  {
    author: 'Fresh',
    probability: defaultProbability,
    text: 'Ahorita no joven',
  },
  {
    author: 'Fresh',
    probability: defaultProbability,
    text: 'Come back tomorrow',
  },
  {
    author: 'Fist',
    probability: defaultProbability,
    text: 'No hay pavos 🗣️🔥',
  },
  {
    author: 'Fist',
    probability: defaultProbability,
    text: 'No vbucks 4 u 🗣️',
  },
  {
    author: 'Fist',
    probability: defaultProbability,
    text: 'Hoy no hay pavos, mañana sí',
  },
  {
    author: '3D3R',
    probability: defaultProbability,
    text: 'Quien sabe',
  },
]
export const defaultEmptyMessage: EmptyMessage = {
  probability: 1,
  isDefault: true,
  text: 'missions',
}
export const defaultEmptyVBucksMessage: EmptyMessage = {
  icon: assets('images/random/pensive-cowboy.png'),
  probability: 1,
  isDefault: true,
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
