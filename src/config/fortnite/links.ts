import { defaultFortniteClient } from './clients'

export const epicGamesLoginURL = 'https://www.epicgames.com/id/login'
export const epicGamesAuthorizationCodeURL = `https://www.epicgames.com/id/api/redirect?clientId=${defaultFortniteClient.use.clientId}&responseType=code`
