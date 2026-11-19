export type StringUnion<Values> =
  | Values
  | (string & {})
