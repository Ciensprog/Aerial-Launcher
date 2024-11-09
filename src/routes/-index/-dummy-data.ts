import {
  World,
  WorldLetter,
} from '../../config/constants/fortnite/world-info'

import { MissionInformation } from './-components/-missions'

export const vbucksMissions: Array<MissionInformation> = [
  {
    id: 'asd',
    mission: {
      imageTypeUrl: 'atlas-c4-group',
      powerRating: 160,
    },
    modifiers: [
      {
        id: 'negative-mini-boss',
      },
      {
        id: 'negative-exploding-deathbomb',
      },
      {
        id: 'negative-elemental-water',
      },
      {
        id: 'negative-uncharted-enemies',
      },
    ],
    rewards: {
      alert: [
        {
          id: 'reagent_c_t04',
          quantity: 456,
        },
        {
          id: 'voucher_generic_worker_sr',
          quantity: 1,
        },
      ],
      base: [
        {
          id: 'reagent_c_t04',
          quantity: 1,
        },
        {
          id: 'eventcurrency_scaling',
          quantity: 1,
        },
      ],
    },
    world: {
      id: World.TwinePeaks,
      letter: WorldLetter.TwinePeaks,
    },
  },
  {
    id: 'qwe',
    mission: {
      imageTypeUrl: 'rtd',
      powerRating: 123,
    },
    modifiers: [
      {
        id: 'negative-mini-boss',
      },
      {
        id: 'negative-exploding-deathbomb',
      },
      {
        id: 'negative-elemental-water',
      },
      {
        id: 'negative-uncharted-enemies',
      },
    ],
    rewards: {
      alert: [
        {
          id: 'reagent_c_t01',
          quantity: 123,
        },
        {
          id: 'voucher_generic_worker_sr',
          quantity: 1,
        },
      ],
      base: [
        {
          id: 'reagent_alteration_upgrade_sr',
          quantity: 1,
        },
        {
          id: 'eventcurrency_scaling',
          quantity: 1,
        },
      ],
    },
    world: {
      id: World.Stonewood,
      letter: WorldLetter.Stonewood,
    },
  },
]

export const missions160s: Array<MissionInformation> = [
  {
    id: 'qwe',
    mission: {
      imageTypeUrl: 'atlas-c4-group',
      powerRating: 160,
    },
    modifiers: [
      {
        id: 'negative-mini-boss',
      },
      {
        id: 'negative-exploding-deathbomb',
      },
      {
        id: 'negative-elemental-water',
      },
      {
        id: 'negative-uncharted-enemies',
      },
    ],
    rewards: {
      alert: [
        {
          id: 'reagent_alteration_ele_nature',
          quantity: 456,
        },
        {
          id: 'voucher_generic_manager_sr',
          quantity: 1,
        },
      ],
      base: [
        {
          id: 'reagent_c_t03',
          quantity: 5,
        },
        {
          id: 'eventcurrency_scaling',
          quantity: 1,
        },
      ],
    },
    world: {
      id: World.Plankerton,
      letter: WorldLetter.Plankerton,
    },
  },
  {
    id: 'asd',
    mission: {
      imageTypeUrl: 'atlas-c4-group',
      powerRating: 160,
    },
    modifiers: [
      {
        id: 'negative-mini-boss',
      },
      {
        id: 'negative-exploding-deathbomb',
      },
      {
        id: 'negative-elemental-water',
      },
      {
        id: 'negative-uncharted-enemies',
      },
    ],
    rewards: {
      alert: [
        {
          id: 'reagent_c_t04',
          quantity: 456,
        },
        {
          id: 'voucher_generic_worker_sr',
          quantity: 1,
        },
      ],
      base: [
        {
          id: 'reagent_c_t04',
          isBad: true,
          quantity: 5,
        },
        {
          id: 'eventcurrency_scaling',
          quantity: 1,
        },
      ],
    },
    world: {
      id: World.CannyValley,
      letter: WorldLetter.CannyValley,
    },
  },
  {
    id: 'zxc',
    mission: {
      imageTypeUrl: 'atlas-c4-group',
      powerRating: 160,
    },
    modifiers: [
      {
        id: 'negative-mini-boss',
      },
      {
        id: 'negative-elemental-fire',
      },
      {
        id: 'negative-uncharted-enemies',
      },
    ],
    rewards: {
      alert: [
        {
          id: 'reagent_c_t04',
          quantity: 456,
        },
        {
          id: 'voucher_generic_worker_sr',
          quantity: 1,
        },
      ],
      base: [
        {
          id: 'reagent_alteration_upgrade_sr',
          quantity: 3,
        },
        {
          id: 'reagent_alteration_upgrade_vr',
          quantity: 2,
        },
        {
          id: 'eventcurrency_scaling',
          quantity: 1,
        },
      ],
    },
    world: {
      id: World.TwinePeaks,
      letter: WorldLetter.TwinePeaks,
    },
  },
]
