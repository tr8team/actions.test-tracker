import * as core from "@actions/core";
import { ILogger } from "../lib/logger";

class GithubActionLogger implements ILogger {
  debug(message: string): void {
    core.debug(message);
  }

  error(message: string): void {
    core.error(message);
  }

  info(message: string): void {
    core.info(message);
  }

  notice(message: string): void {
    core.notice(message);
  }

  warning(message: string): void {
    core.warning(message);
  }
}

export { GithubActionLogger };
