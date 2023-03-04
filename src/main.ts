import { App } from "./lib/main.js";
import { GithubActionIO } from "./external/github-action-i-o.js";
import { GithubActionLogger } from "./external/github-action-logger.js";
import { ZodValidatorAdapter } from "./lib/adapters/zod-validator-adapter.js";
import { InputArray, inputArray } from "./lib/inputs.js";
import { GistKeyValue } from "./external/gist-key-value.js";
import { ActionIO } from "./lib/interface/io.js";
import { Octokit } from "@octokit/rest";
import { IoInputRetriever } from "./lib/adapters/io-input-retriever.js";
import { InputRetriever } from "./lib/interface/input-retriever.js";
import { KeyValueRepository } from "./lib/interface/repo.js";
import { ContextRetriever } from "./lib/interface/context-retriever.js";
import { GithubActionContextRetriever } from "./external/github-action-context.js";
import { Validator } from "./lib/interface/validator.js";
import { HistoryService, IHistoryService } from "./lib/service.js";
import { ILogger } from "./lib/interface/logger.js";
import { setFailed } from "@actions/core";

async function main(): Promise<void> {
  const io: ActionIO = new GithubActionIO();
  const log: ILogger = new GithubActionLogger();
  const auth = io.get("github_token");
  const gistId = io.get("gist_id");
  const ok = new Octokit({ auth });
  const kv: KeyValueRepository = new GistKeyValue(ok, gistId);
  const context: ContextRetriever = new GithubActionContextRetriever();
  const inputValidator: Validator<InputArray> = new ZodValidatorAdapter(
    inputArray
  );
  const input: InputRetriever = new IoInputRetriever(
    io,
    context,
    inputValidator
  );

  const service: IHistoryService = new HistoryService(kv);
  const app = new App(io, input, service);

  await app.start().match({
    none: () => {
      log.info("✅ Successfully tracked commit artifact metadata");
    },
    some: (err) => {
      log.error("❌ Failed to track commit artifact metadata");
      setFailed(err);
    },
  });
}

await main();
