import { GithubActionIO } from "../../../../src/external/github-action-i-o";
import { debug, setFailed } from "@actions/core";
import { None } from "../../../../src/lib/core/option";

async function main() {
  const action = new GithubActionIO();

  const p = action.getObject<object>("person", None());
  return await p.match({
    err: (error)=> {
      setFailed(error.message);
    },
    ok: (person)=> {
      debug(JSON.stringify(person));
    },
  });
}

main().then();
