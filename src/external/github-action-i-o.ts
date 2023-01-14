import { ActionIO } from "../lib/interface/io";
import { getInput, setOutput } from "@actions/core";
import { parseJSON } from "../lib/util";
import { Validator } from "../lib/interface/validator";
import { Option, Result } from "@hqoss/monads";

class GithubActionIO implements ActionIO {
  get(key: string): string {
    return getInput(key);
  }

  getObject<T>(key: string, validator: Option<Validator<T>>): Result<T, Error> {
    const raw = this.get(key);
    const json = parseJSON(raw);

    return validator
      .map((v) => json.andThen<T>((j) => v.parse(j)))
      .unwrapOr(json as Result<T, Error>);
  }

  set(key: string, value: string): void {
    setOutput(key, value);
  }

  setObject(key: string, value: object): void {
    setOutput(key, JSON.stringify(value));
  }
}

export { GithubActionIO };
