import { Result } from "../core/result";
import { Option } from "../core/option";

interface KeyValueRepository {
  read<T>(key: string): Result<Option<T>, Error>;

  write<T>(key: string, value: T): Option<Error>;

  delete(key: string): Option<Error>;
}

export { KeyValueRepository };
