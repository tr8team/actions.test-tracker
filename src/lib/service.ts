import { Inputs, PR } from "./interface/input-retriever.js";
import { Ok, Result } from "./core/result.js";
import { Output } from "./outputs.js";
import { KeyValueRepository } from "./interface/repo.js";
import { HistoryEntry, InputArray } from "./inputs.js";
import { Option } from "./core/option.js";

interface IHistoryService {
  store(input: Inputs): Result<Output, Error>;
}

interface UpdateHistoryEntry {
  preImage: HistoryEntry[];
  afterImage: HistoryEntry[];
}

class HistoryService implements IHistoryService {
  #kv: KeyValueRepository;

  constructor(kv: KeyValueRepository) {
    this.#kv = kv;
  }

  inputArrayToHistoryEntry(
    input: InputArray,
    sha: string,
    repoUrl: string,
    actionUrl: string
  ): HistoryEntry {
    return {
      sha,
      url: repoUrl,
      action: actionUrl,
      items: input,
    };
  }

  writeSHA(
    prefix: string,
    sha: string,
    entry: HistoryEntry
  ): Result<null, Error> {
    const key = `${prefix}${sha}-commit.json`;
    return this.#kv.write(key, entry).asErr(null);
  }

  writePR(
    prefix: string,
    pr: PR,
    entry: HistoryEntry
  ): Result<UpdateHistoryEntry, Error> {
    const key = `${prefix}${pr.number}-pr.json`;
    return this.#kv
      .read<HistoryEntry[]>(key)
      .map((histories) => histories.unwrapOr([]))
      .andThen((histories) => {
        const afterImage = [entry, ...histories];
        return this.#kv
          .write(key, afterImage)
          .asErr({ preImage: histories, afterImage });
      });
  }

  getBaseSHA(prefix: string, pr: PR): Result<Option<HistoryEntry>, Error> {
    const key = `${prefix}${pr.baseSha}-commit.json`;
    return this.#kv.read<HistoryEntry>(key);
  }

  async buildOutput(
    current: HistoryEntry,
    update: UpdateHistoryEntry,
    baseRef: Option<HistoryEntry>
  ): Promise<Output> {
    const b = await baseRef
      .map<{ base?: HistoryEntry }>((base) => ({ base }))
      .unwrapOr({});
    return {
      current,
      ...b,
      ...update,
    };
  }

  store(inputs: Inputs): Result<Output, Error> {
    // generate entry
    const entry = this.inputArrayToHistoryEntry(
      inputs.data,
      inputs.sha,
      inputs.repoUrl,
      inputs.actionUrl
    );

    return (
      this
        // Write Single SHA to gist, regardless
        .writeSHA(inputs.prefix, inputs.sha, entry)
        .andThen(() =>
          inputs.pr.match({
            // if not PR, ends
            none: Ok({ current: entry }),
            // If PR
            some: (pr): Result<Output, Error> => {
              // Update PR History
              const update = this.writePR(inputs.prefix, pr, entry);
              // Get Base SHA
              const base = this.getBaseSHA(inputs.prefix, pr);
              // Merge Results
              return update.andThen((u) =>
                base.map((b) => this.buildOutput(entry, u, b))
              );
            },
          })
        )
    );
  }
}

export { HistoryService };

export type { IHistoryService };
