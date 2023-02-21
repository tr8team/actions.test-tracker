import { Result } from "../core/result";

interface Validator<T> {
  parse(input: unknown): Result<T, Error>;
}

export { Validator };
