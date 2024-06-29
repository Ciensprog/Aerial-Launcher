export type StringUnion<Values> =
  | Values
  | (string & Record<string, unknown>)
