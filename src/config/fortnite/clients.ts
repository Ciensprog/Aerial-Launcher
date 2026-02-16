import {
  clientCredentialSchema,
  defaultClientCredentialSchema,
} from '../../lib/validations/schemas/fortnite/clients'

export const fortniteIOSGameClient = clientCredentialSchema.parse({
  clientId: '3446cd72694c4a4485d81b77adbb2141',
  secret: '9209d4a5e25a457fb9b07489d313b41a',
  auth: 'MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=',
})

export const fortniteAndroidGameClient = clientCredentialSchema.parse({
  clientId: '3f69e56c7649492c8cc29f1af08a8a12',
  secret: 'b51ee9cb12234f50a69efa67ef53812e',
  auth: 'M2Y2OWU1NmM3NjQ5NDkyYzhjYzI5ZjFhZjA4YThhMTI6YjUxZWU5Y2IxMjIzNGY1MGE2OWVmYTY3ZWY1MzgxMmU=',
})

export const fortnitePCGameClient = clientCredentialSchema.parse({
  clientId: 'ec684b8c687f479fadea3cb2ad83f5c6',
  secret: 'e1f31c211f28413186262d37a13fc84d',
  auth: 'ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ=',
})

export const launcherAppClient2 = clientCredentialSchema.parse({
  clientId: '34a02cf8f4414e29b15921876da36f9a',
  secret: 'daafbccc737745039dffe53d94fc76cf',
  auth: 'MzRhMDJjZjhmNDQxNGUyOWIxNTkyMTg3NmRhMzZmOWE6ZGFhZmJjY2M3Mzc3NDUwMzlkZmZlNTNkOTRmYzc2Y2Y=',
})

export const defaultFortniteClient = defaultClientCredentialSchema.parse({
  use: fortniteAndroidGameClient,
})
