import { Option, Result } from "@hqoss/monads";

interface KeyValueRepository<T> {
  read(key: string): Promise<Result<Option<T>, Error>>;

  write(key: string, value: T): Promise<Option<Error>>;

  delete(key: string): Promise<Option<Error>>;
}

export { KeyValueRepository };
