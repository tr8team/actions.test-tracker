import { GithubActionContextRetriever } from "../../../../src/external/github-action-context.js";
import { debug } from "@actions/core";

const contextRetriever = new GithubActionContextRetriever();

const event = contextRetriever.event

switch(event.__kind) {
  case "push":
    debug(`ref: ${event.value.ref}`);
    debug(`shaAfter: ${event.value.shaAfter}`);
    debug(`shaBefore: ${event.value.shaBefore}`);
    break;
  case "pullRequest":
    debug(`number: ${event.value.number}`);
    debug(`pullRequestState: ${event.value.pullRequestState}`);
    debug(`baseRef: ${event.value.baseRef}`);
    debug(`baseRefSha: ${event.value.baseRefSha}`);
    break;
  case "other":
    debug(`value: ${JSON.stringify(event.value)}`)
    break;
}

debug(`sha: ${contextRetriever.sha}`)
debug(`baseUrl: ${contextRetriever.baseUrl}`)
debug(`actionUrl: ${contextRetriever.actionUrl}`)
debug(`repoUrl: ${contextRetriever.repoUrl}`)
debug(`org: ${contextRetriever.org}`)
debug(`repo: ${contextRetriever.repo}`)
