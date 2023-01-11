import { StructError } from "superstruct";
import { Err, Ok, Result } from "ts-results";

function toResult<T>([err, val]:
  | [StructError, undefined]
  | [undefined, T]): Result<T, StructError> {
  if (err != null) {
    return Err(err);
  }
  return Ok(val);
}

function parseJSON(raw: string): Result<unknown, Error> {
  try {
    const json: unknown = JSON.parse(raw);
    return Ok(json);
  } catch (e) {
    return Err(e as Error);
  }
}

export { toResult, parseJSON };
