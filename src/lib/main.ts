// import { ILogger } from "./interface/logger";
// import { History, HistoryEntry, InputArray } from "./inputs";
// import { Validator } from "./interface/validator";
// import { KeyValueRepository } from "./interface/repo";
// import { ContextRetriever, GitHubActionPullRequestEvent } from "./interface/context-retriever";
// import { Result } from "./core/result";
//
// interface Inputs {
//   data: InputArray;
//   prefix: string;
//   sha: string;
//   repoUrl: string;
//   actionUrl: string;
// }
//
// interface DerivedInput {
//   historyEntry: HistoryEntry;
//   prefix: string;
//   prPrefix: string;
//   commitPrefix: string;
//   sha: string;
//   repoUrl: string;
//   actionUrl: string;
// }
//
// function deriveInput(input: Inputs): DerivedInput {
//   const prefix = input.prefix.length === 0 ? "" : `${input.prefix}-`
//   return {
//     historyEntry: {
//       sha: input.sha,
//       url: input.repoUrl,
//       action: input.actionUrl,
//       items: input.data,
//     },
//     prefix,
//     prPrefix: (pr) => `${prefx}-pr-${pr}`,
//
//   }
// }
//
//
// class App {
//   log: ILogger;
//   kv: KeyValueRepository;
//   inputValidator: Validator<InputArray>;
//   context: ContextRetriever;
//
//   constructor(
//     log: ILogger,
//     kv: KeyValueRepository,
//     inputValidator: Validator<InputArray>,
//     contextRetriever: ContextRetriever
//   ) {
//     this.log = log;
//     this.kv = kv;
//     this.inputValidator = inputValidator;
//     this.context = contextRetriever;
//   }
//
//   inputArrayToHistoryEntry(input: InputArray, sha: string, repoUrl: string, actionUrl: string): HistoryEntry {
//     return {
//       sha: sha,
//       url: repoUrl,
//       action: actionUrl,
//       items: input
//     };
//   }
//
//
//
//   start(): Result<string, Error> {
//
//
//
//
//     const actionUrl = this.context.actionUrl;
//
//     const data = PR(() => Promise.resolve(this.io.getObject("data", Some(this.inputValidator))));
//     data
//       .map((d) => {
//         return {
//           sha: sha,
//           url: repoUrl,
//           action: actionUrl,
//           items: d
//         } as HistoryEntry;
//       })
//       // store as sha
//       .andThenAsync(async (d): Promise<Result<HistoryEntry, Error>> => {
//         const r = await this.kv.write(`${prefix}-${sha}`, d);
//         if (r.isSome()) {
//           return Err(r.unwrap());
//         } else {
//           return Ok(d);
//         }
//       })
//       // append history
//       .andThenAsync((d) => {
//         return githubActionEvent.match(this.context.event, {
//           Other(): Promise<Result<HistoryEntry, Error>> {
//             return Promise.resolve(Ok(d));
//           },
//           default(): Promise<Result<HistoryEntry, Error>> {
//             return Promise.resolve(Ok(d));
//           },
//           PullRequest: async (p: GitHubActionPullRequestEvent): Promise<Result<HistoryEntry, Error>> => {
//             const k = `${prefix}-pr-${p.number}`;
//             const historyRaw = await this.kv.read<History>(k);
//             const r: Result<History, Error> = historyRaw
//               .map(x => x.unwrapOr([]))
//               .map(x => [...x, d])
//               .andThen(x => {
//
//               });
//
//
//           }
//         });
//       })
//     ;
//
//
//     return Ok("complete");
//   }
// }
//
// export { App };
