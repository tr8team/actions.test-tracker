import { KeyValueRepository } from "../lib/interface/repo.js";
import { Octokit } from "@octokit/rest";
import { catchToResult } from "../lib/util.js";
import { None, Opt, Option, Some } from "../lib/core/option.js";
import { Err, Ok, Res, Result } from "../lib/core/result.js";

class GistKeyValue implements KeyValueRepository {
  octokit: Octokit;
  gistId: string;

  constructor(octokit: Octokit, gistId: string) {
    this.octokit = octokit;
    this.gistId = gistId;
  }

  delete(key: string): Option<Error> {
    return Opt.async(async () => {
      try {
        await this.octokit.gists.update({
          // eslint-disable-next-line camelcase
          gist_id: this.gistId,
          files: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [`${key}.json`]: null as any,
          },
        });
        return None();
      } catch (e) {
        return Some(catchToResult(e));
      }
    });
  }

  read<T>(key: string): Result<Option<T>, Error> {
    return Res.async(async () => {
      try {
        // api call
        const r = await this.octokit.gists.get({
          // eslint-disable-next-line camelcase
          gist_id: this.gistId,
        });
        if (r.data.files && r.data.files[`${key}.json`]) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const c = r.data.files[`${key}.json`]!.content as string;
          const o = Some(JSON.parse(c));
          return Ok(o);
        }
        return Ok(None());
      } catch (e) {
        return Err(catchToResult(e));
      }
    });
  }

  write<T>(key: string, value: T): Option<Error> {
    return Opt.async(async () => {
      try {
        await this.octokit.gists.update({
          // eslint-disable-next-line camelcase
          gist_id: this.gistId,
          description: "Automated Gist update from test tracker GitHub Action",
          files: {
            [`${key}.json`]: {
              content: JSON.stringify(value),
            },
          },
        });
        return None();
      } catch (e) {
        return Some(catchToResult(e));
      }
    });
  }
}

export { GistKeyValue };
