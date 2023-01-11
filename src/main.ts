import { debug, setFailed, setOutput } from "@actions/core";
import { ActionIO } from "./lib/io";
import { GithubActionIo } from "./external/github-action-io";
import { inputArray } from "./lib/inputs";

const io: ActionIO = new GithubActionIo();

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
