import {
  ContextRetriever,
  GitHubActionEvent,
  GitHubActionPullRequestEvent,
} from "../lib/interface/context-retriever.js";
import { context } from "@actions/github";
import { PullRequestEvent, PushEvent } from "@octokit/webhooks-types";

class GithubActionContextRetriever implements ContextRetriever {
  get event(): GitHubActionEvent {
    if (context.eventName === "push") {
      const event = context.payload as PushEvent;
      const push = {
        ref: event.ref,
        shaAfter: event.after,
        shaBefore: event.before,
      };
      return {
        __kind: "push",
        value: push,
      };
    } else if (context.eventName === "pull_request") {
      const event = context.payload as PullRequestEvent;
      const pr: GitHubActionPullRequestEvent = {
        number: event.number,
        pullRequestState: event.pull_request.state,
        baseRef: event.pull_request.base.ref,
        baseRefSha: event.pull_request.base.sha,
      };
      return {
        __kind: "pullRequest",
        value: pr,
      };
    } else {
      return {
        __kind: "other",
        value: context.payload,
      };
    }
  }

  get sha(): string {
    return context.sha;
  }

  get baseUrl(): string {
    return `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}`;
  }

  get actionUrl(): string {
    return `${this.baseUrl}/actions/runs/${context.runId}/jobs/${context.job}`;
  }

  get repoUrl(): string {
    return `${this.baseUrl}/tree/${this.sha}`;
  }

  get org(): string {
    return context.repo.owner;
  }

  get repo(): string {
    return context.repo.repo;
  }
}

export { GithubActionContextRetriever };
