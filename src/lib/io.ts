import { Result } from "ts-results";
import { StructError } from "superstruct";

interface ActionIO {
  get(key: string): string;

  getObject<T>(key: string): Result<T, StructError | Error>;

  set(key: string, value: string): void;

  setObject(key: string, value: object): void;
}

export { ActionIO };
