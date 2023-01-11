import { GithubActionIO } from "../../../../src/external/github-action-i-o";

const action = new GithubActionIO();
action.setObject("first-key", { name: "Ernest", age: 17 });
