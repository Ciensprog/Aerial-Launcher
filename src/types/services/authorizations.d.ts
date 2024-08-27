export type AuthorizationCommonResponse<ExtraProps = unknown> =
  ExtraProps & {
    access_token: string
    expires_in: number
    expires_at: string
    token_type: string
    refresh_token: string
    refresh_expires: number
    refresh_expires_at: string
    account_id: string
    client_id: string
    internal_client: boolean
    client_service: string
    displayName: string
    app: string
    in_app_id: string
    device_id: string
    product_id: string
    application_id: string
    acr: string
    auth_time: string
  }

export type AuthorizationCodeResponse = AuthorizationCommonResponse<{
  scope: Array<string>
}>

export type VerifyAccessTokenResponse = Omit<
  AuthorizationCommonResponse,
  'displayName'
> & {
  display_name: string
}

export type ExchangeCodeResponse = AuthorizationCommonResponse

export type CreateExchangeCodeResponse = {
  expiresInSeconds: number
  code: string
  creatingClientId: string
}

export type CreateAccessTokenWithClientCredentialsResponse = {
  access_token: string
  expires_in: number
  expires_at: string
  token_type: string
  client_id: string
  internal_client: boolean
  client_service: string
  product_id: string
  application_id: string
}

export type DeviceAuthResponse = {
  deviceId: string
  accountId: string
  secret: string
  userAgent: string
  created: Record<string, string>
}

export type AuthorizationError = {
  errorCode: string
  errorMessage: string
  messageVars: Array<string>
  numericErrorCode: number
  originatingService: string
  intent: string
  error_description?: string
  error?: string
}

export type AuthenticationResponseSchema<Data> = {
  data: Data | null
}

export type DeviceAuthListResponse = Array<DeviceAuthInfo>

export type DeviceAuthInfo = {
  deviceId: string
  accountId: string
  userAgent: string
  created: {
    location: string
    ipAddress: string
    dateTime: string
  }
  lastAccess?: {
    location: string
    ipAddress: string
    dateTime: string
  }
}
