import { ActionIO } from "../lib/io";
import { Result } from "ts-results";
import { Struct, StructError } from "superstruct";
import { getInput, setOutput } from "@actions/core";
import { parseJSON, toResult } from "../lib/util";

class GithubActionIo implements ActionIO {
  get(key: string): string {
    return getInput(key);
  }

  getObject<T>(
    key: string,
    validator?: Struct<T>
  ): Result<T, StructError | Error> {
    const raw = this.get(key);
    const json = parseJSON(raw);
    if (validator != null) {
      return json.andThen((j) => toResult(validator!.validate(j)));
    }
    return json as Result<T, StructError | Error>;
  }

  set(key: string, value: string): void {
    setOutput(key, value);
  }

  setObject(key: string, value: object): void {
    setOutput(key, JSON.stringify(value));
  }
}

export { GithubActionIo };
