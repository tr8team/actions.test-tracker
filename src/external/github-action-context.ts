import {
  ContextRetriever,
  GitHubActionEvent,
  GitHubActionPullRequestEvent,
} from "../lib/interface/context-retriever.js";
import { PullRequestEvent, PushEvent } from "@octokit/webhooks-types";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Context } from "@actions/github/lib/context";

class GithubActionContextRetriever implements ContextRetriever {
  #context: Context;

  constructor() {
    this.#context = new Context();
  }

  get event(): GitHubActionEvent {
    if (this.#context.eventName === "push") {
      const event = this.#context.payload as PushEvent;
      const push = {
        ref: event.ref,
        shaAfter: event.after,
        shaBefore: event.before,
      };
      return {
        __kind: "push",
        value: push,
      };
    } else if (this.#context.eventName === "pull_request") {
      const event = this.#context.payload as PullRequestEvent;
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
        value: this.#context.payload,
      };
    }
  }

  get sha(): string {
    if (this.#context.eventName === "push") {
      const event = this.#context.payload as PushEvent;
      return event.after;
    } else if (this.#context.eventName === "pull_request") {
      const event = this.#context.payload as PullRequestEvent;
      return event.pull_request.head.sha;
    } else {
      return this.#context.sha;
    }
  }

  get baseUrl(): string {
    return `${this.#context.serverUrl}/${this.#context.repo.owner}/${
      this.#context.repo.repo
    }`;
  }

  get actionUrl(): string {
    return `${this.baseUrl}/actions/runs/${this.#context.runId}/jobs/${
      this.#context.job
    }`;
  }

  get repoUrl(): string {
    return `${this.baseUrl}/tree/${this.sha}`;
  }

  get org(): string {
    return this.#context.repo.owner;
  }

  get repo(): string {
    return this.#context.repo.repo;
  }
}

export { GithubActionContextRetriever };
