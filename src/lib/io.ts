import { Result } from "ts-results";
import { Struct, StructError } from "superstruct";

interface ActionIO {
  get(key: string): string;

  getObject<T>(
    key: string,
    validator?: Struct<T>
  ): Result<T, StructError | Error>;

  set(key: string, value: string): void;

  setObject(key: string, value: object): void;
}

export { ActionIO };
