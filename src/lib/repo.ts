import { Option } from "ts-results";

interface KeyValueRepository<T> {
  read(key: string): T;

  write(key: string, value: T): Option<string>;
}

export { KeyValueRepository };
