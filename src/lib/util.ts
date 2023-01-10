import { StructError } from "superstruct";
import { Err, Ok, Result } from "ts-results";

export function toResult<T>([err, val]:
  | [StructError, undefined]
  | [undefined, T]): Result<T, StructError> {
  if (err != null) {
    return Err(err);
  }
  return Ok(val);
}
