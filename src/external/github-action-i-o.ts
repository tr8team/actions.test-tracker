import { ActionIO } from "../lib/interface/io";
import { getInput, setOutput } from "@actions/core";
import { parseJSON } from "../lib/util";
import { Validator } from "../lib/interface/validator";
import { Ok, Result } from "../lib/core/result";
import { Option } from "../lib/core/option";

class GithubActionIO implements ActionIO {
  get(key: string): string {
    return getInput(key);
  }

  getObject<T>(key: string, validator: Option<Validator<T>>): Result<T, Error> {
    const raw = this.get(key);
    return parseJSON(raw).andThen(async (j) =>
      validator.asResult({
        none: () => Ok(j) as Result<T, Error>,
        some: (v) => v.parse(j),
      })
    );
  }

  set(key: string, value: string): void {
    setOutput(key, value);
  }

  setObject(key: string, value: object): void {
    setOutput(key, JSON.stringify(value));
  }
}

export { GithubActionIO };
