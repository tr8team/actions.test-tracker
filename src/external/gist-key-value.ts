import { KeyValueRepository } from "../lib/interface/repo";
import { Octokit } from "@octokit/rest";
import { Err, None, Ok, Option, Result, Some } from "@hqoss/monads";
import { catchToResult } from "../lib/util";

class GistKeyValue<T> implements KeyValueRepository<T> {
  octokit: Octokit;
  gistId: string;

  constructor(octokit: Octokit, gistId: string) {
    this.octokit = octokit;
    this.gistId = gistId;
  }

  async delete(key: string): Promise<Option<Error>> {
    try {
      await this.octokit.gists.update({
        // eslint-disable-next-line camelcase
        gist_id: this.gistId,
        files: {
          [`${key}.json`]: null as any,
        },
      });
      return None;
    } catch (e) {
      return Some(catchToResult(e));
    }
  }

  async read(key: string): Promise<Result<Option<T>, Error>> {
    try {
      // api call
      const r = await this.octokit.gists.get({
        // eslint-disable-next-line camelcase
        gist_id: this.gistId,
      });
      if (r.data.files && r.data.files[`${key}.json`]) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const c = r.data.files[`${key}.json`]!.content as string;

        return Ok(Some(JSON.parse(c)));
      }
      return Ok(None);
    } catch (e) {
      return Err(catchToResult(e));
    }
  }

  async write(key: string, value: T): Promise<Option<Error>> {
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
      return None;
    } catch (e) {
      return Some(catchToResult(e));
    }
  }
}

export { GistKeyValue };
