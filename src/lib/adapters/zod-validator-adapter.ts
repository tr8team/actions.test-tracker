import { ZodType, ZodTypeDef } from "zod";
import { Validator } from "../interface/validator";
import { Result } from "@hqoss/monads";
import { toResult } from "../util";

class ZodValidatorAdapter<T, X extends ZodTypeDef> implements Validator<T> {
  private validator: ZodType<T, X, T>;

  constructor(validator: ZodType<T, X, T>) {
    this.validator = validator;
  }

  parse(input: unknown): Result<T, Error> {
    return toResult(this.validator.safeParse(input));
  }
}

export { ZodValidatorAdapter };
