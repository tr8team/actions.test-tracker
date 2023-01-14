import { Result } from "@hqoss/monads";

interface Validator<T> {
  parse(input: unknown): Result<T, Error>;
}

export { Validator };
