import { debug, setFailed, setOutput } from "@actions/core";
import { ActionIO } from "./lib/io";
import { GithubActionIO } from "./external/github-action-i-o";
import { inputArray } from "./lib/inputs";

const io: ActionIO = new GithubActionIO();

const dataArray = io.getObject("data", inputArray);
const gistId = io.get("gist_id");
const token = io.get("github_token");
const prNumber = io.get("pr_number");

try {
  dataArray
    .map((history) => {
      debug(`data: ${JSON.stringify(history)}`);
      debug(`gistId: ${gistId}`);
      debug(`token: ${token}`);
      debug(`pr_number: ${prNumber}`);
    })
    .unwrap();
} catch (error) {
  if (error instanceof Error) setFailed(error.message);
}
setOutput("time", new Date().toTimeString());
