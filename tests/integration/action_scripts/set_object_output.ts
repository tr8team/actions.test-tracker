import { GithubActionIo } from "../../../src/external/github-action-io";

const action = new GithubActionIo();
action.setObject("first-key", { name: "Ernest", age: 17 });
