import { repositoryAssetsURL } from '../../../config/about/links'

import { toast } from '../../../lib/notifications'

export function useActions() {
  const handleEricDejaDeJoder = () => {
    toast(
      <figure>
        <img
          src={`${repositoryAssetsURL}/images/random/donald-duck-angry.gif`}
          className="h-60 w-80 object-contain"
          alt="Eric deja de joder"
        />
        <figcaption className="font-bold mt-1.5 text-center text-lg text-muted">
          Eric deja de joder 💀
        </figcaption>
      </figure>
    )
  }

  return {
    handleEricDejaDeJoder,
  }
}
