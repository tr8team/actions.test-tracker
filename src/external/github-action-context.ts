import {
  ContextRetriever,
  GitHubActionEvent,
} from "../lib/interface/context-retriever";
import { context } from "@actions/github";
// eslint-disable-next-line import/no-unresolved
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
      const pr = {
        number: event.number,
        // eslint-disable-next-line camelcase
        pull_request_state: event.pull_request.state,
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
