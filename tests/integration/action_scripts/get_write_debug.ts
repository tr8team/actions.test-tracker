import { GithubActionIo } from "../../../src/external/github-action-io";
import { debug } from "@actions/core";

const action = new GithubActionIo();

const name = action.get("name");
const age = action.get("age");

debug(`Hello ${name}!`);
debug(`You are ${age} years old!`);
