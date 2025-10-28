import { useState } from 'react'

import { toast } from '../../../lib/notifications'

export function useWhy({
  inputSearchValue,
}: {
  inputSearchValue: string
}) {
  const [showLink, setShowLink] = useState(false)

  const handleLve = () => {
    const options = [['ku', 'da', 'ena', 'mor', 'ado'].join('')]
    const value = inputSearchValue.trim().toLowerCase()

    if (options.includes(value)) {
      toast(
        <figure>
          <img
            src={qdalve}
            className="object-contain rounded size-24"
            alt="Kuda's blush"
          />
        </figure>,
        {
          style: {
            backgroundColor: 'hsl(0 0% 3.9%)',
            padding: 0,
          },
          unstyled: true,
        }
      )
    }
  }

  const handleXD = () => {
    const options = [
      ['cu', 'di', 'ta'].join(''),
      ['ku', 'di', 'ta'].join(''),
      ['q', 'di', 'ta'].join(''),
    ]
    const value = inputSearchValue.trim().toLowerCase()

    if (options.includes(value)) {
      toast(
        <figure>
          <img
            src={qdaimg}
            className="object-contain rounded size-30"
            alt="Kuda's blush"
          />
        </figure>,
        {
          style: {
            padding: 0,
          },
          unstyled: true,
        }
      )
    }
  }

  const handleWhy = () => {
    setShowLink(false)

    const options = [
      [
        '7aa1',
        '74b4',
        '00f4',
        '40ba',
        '9059',
        'd746',
        '5665',
        'e351',
      ].join(''),
      ['ku', 'da po', 'tencia', 'dores'].join(''),
      ['cu', 'da'].join(''),
      ['ku', 'da'].join(''),
      ['q', 'da'].join(''),
      ['po', 'tenci', 'ador'].join(''),
      ['po', 'tenci', 'adores'].join(''),
      ['xp', 'boos', 'ts'].join(''),
      ['xpb', 'oost'].join(''),
      ['x', 'p boo', 'sts'].join(''),
      ['x', 'p bo', 'ost'].join(''),
      ['im', 'not', 'wak'].join(''),
      ['w', 'a', 'k'].join(''),
    ]
    const value = inputSearchValue.trim().toLowerCase()

    if (options.includes(value)) {
      setShowLink(true)
    }
  }

  return {
    showLink,

    handleXD,
    handleLve,
    handleWhy,
  }
}

const qdaimg =
  'data:image/webp;base64,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'

const qdalve =
  'data:image/png;base64,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'
