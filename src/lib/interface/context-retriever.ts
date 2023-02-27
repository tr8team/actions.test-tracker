import { DU } from "../core/discrimminated-union.i.js";

interface GitHubActionPushEvent {
  // Full git ref that was pushed. Example: refs/heads/main or refs/tags/v3.14.1
  ref: string;

  // Commit SHA before Push
  shaBefore: string;

  // Commit SHA after Push
  shaAfter: string;
}

interface GitHubActionPullRequestEvent {
  // pull request number
  number: number;
  // Pull requests' base branch's full reference. Example: refs/heads/main
  baseRef: string;
  // Pull requests' base branch's SHA
  baseRefSha: string;
  // state of pull request
  pullRequestState: "open" | "closed";
}

type GitHubActionEvent = DU<
  [
    ["push", GitHubActionPushEvent],
    ["pullRequest", GitHubActionPullRequestEvent],
    ["other", object]
  ]
>;

interface ContextRetriever {
  sha: string;
  event: GitHubActionEvent;
  org: string;
  repo: string;
  repoUrl: string;
  actionUrl: string;
}

export type {
  GitHubActionEvent,
  ContextRetriever,
  GitHubActionPushEvent,
  GitHubActionPullRequestEvent,
};
