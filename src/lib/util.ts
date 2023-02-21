import { ZodError } from "zod";
import { Err, Ok, Result } from "./core/result";
import { None, Option, Some } from "./core/option";

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

function stringToOption(s: string | null | undefined): Option<string> {
  if (s == null) {
    return None();
  }
  return s.length === 0 ? None() : Some(s);
}

export { toResult, parseJSON, catchToResult, stringToOption };
