export type CommonErrorResponse = {
  errorCode: string
  errorMessage: string
  intent: string
  messageVars: Array<string>
  numericErrorCode: number
  originatingService: string
}
