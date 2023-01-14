import { Validator } from "./validator";
import { Option, Result } from "@hqoss/monads";

interface ActionIO {
  get(key: string): string;

  getObject<T>(key: string, validator: Option<Validator<T>>): Result<T, Error>;

  set(key: string, value: string): void;

  setObject(key: string, value: object): void;
}

export { ActionIO };
