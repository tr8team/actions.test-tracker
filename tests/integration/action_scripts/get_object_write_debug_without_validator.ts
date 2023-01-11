import { GithubActionIo } from "../../../src/external/github-action-io";
import { debug, setFailed } from "@actions/core";

const action = new GithubActionIo();

const p = action.getObject<object>("person");

if (p.ok) {
  const per: object = p.unwrap();
  debug(JSON.stringify(per));
} else {
  const err = p.val as Error;
  setFailed(err.message);
}
