import { ZodError } from "zod";
import { Err, Ok, Result } from "@hqoss/monads";

function toResult<T>(
  du: { success: true; data: T } | { success: false; error: ZodError }
): Result<T, ZodError> {
  if (du.success) {
    return Ok(du.data);
  }
  return Err(du.error);
}

function parseJSON<T>(raw: string): Result<T, Error> {
  try {
    const json: T = JSON.parse(raw);
    return Ok(json);
  } catch (e) {
    return Err(e as Error);
  }
}

function catchToResult(e: unknown): Error {
  if (e instanceof Error) {
    return e;
  } else if (typeof e === "string") {
    return new Error(e);
  }
  return new Error(JSON.stringify(e));
}

export { toResult, parseJSON, catchToResult };
