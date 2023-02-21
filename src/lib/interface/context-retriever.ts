import { DU } from "../core/discrimminated_union";

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
  // state of pull request
  pull_request_state: "open" | "closed";
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

export {
  GitHubActionEvent,
  ContextRetriever,
  GitHubActionPushEvent,
  GitHubActionPullRequestEvent,
};
