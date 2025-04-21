export type StringUnion<Values> =
  | Values
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {})
