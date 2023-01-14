import { GithubActionIO } from "../../../../src/external/github-action-i-o";
import { debug, setFailed } from "@actions/core";
import { None } from "@hqoss/monads";

const action = new GithubActionIO();

const p = action.getObject<object>("person", None);

if (p.isOk()) {
  const per: object = p.unwrap();
  debug(JSON.stringify(per));
} else {
  const err = p.unwrapErr();
  setFailed(err.message);
}
