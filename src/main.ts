// import { App } from "./lib/main";
// import { GithubActionIO } from "./external/github-action-i-o";
// import { GithubActionLogger } from "./external/github-action-logger";
// import { ZodValidatorAdapter } from "./lib/adapters/zod-validator-adapter";
// import { History, inputArray } from "./lib/inputs";
// import { info, setFailed } from "@actions/core";
// import { GistKeyValue } from "./external/gist-key-value";
// import { Octokit } from "@octokit/rest";
//
// const octokit = new Octokit();
// const io = new GithubActionIO();
// const log = new GithubActionLogger();
// const kv = new GistKeyValue<History>(octokit, "");
// const inputValidator = new ZodValidatorAdapter(inputArray);
// const app = new App(io, log, kv, inputValidator);
//
// app.start().match({
//   err(val: Error): void {
//     return setFailed(val.message);
//   },
//   ok(val: string): void {
//     return info(val);
//   },
// });
