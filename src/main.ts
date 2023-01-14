import { App } from "./lib/main";
import { GithubActionIO } from "./external/github-action-i-o";
import { GithubActionLogger } from "./external/github-action-logger";
import { ZodValidatorAdapter } from "./lib/adapters/zod-validator-adapter";
import { inputArray } from "./lib/inputs";
import { info, setFailed } from "@actions/core";

const io = new GithubActionIO();
const log = new GithubActionLogger();
const v = new ZodValidatorAdapter(inputArray);
const app = new App(io, log, v);

app.start().match({
  err(val: Error): void {
    return setFailed(val.message);
  },
  ok(val: string): void {
    return info(val);
  },
});
