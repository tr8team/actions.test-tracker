import { afterAll, afterEach, describe, it, should, vi } from "vitest";
// @ts-ignore
import { actionScripts, backupStdOut, emulateAction } from "./helper.js";
import * as path from "path";

should();

const f = backupStdOut();
afterAll(() => {
  f.restore();
});

afterEach(() => {
  vi.unstubAllEnvs();
})

describe("ContextRetriever", function(){
  describe("pr", function() {
    it("should correctly return all PR values", async function() {
      const expected = {
        "debug": [
          {
            "content": "number: 661",
            "meta": {}
          },
          {
            "content": "pullRequestState: open",
            "meta": {}
          },
          {
            "content": "baseRef: main",
            "meta": {}
          },
          {
            "content": "baseRefSha: 74eeff386ccaecbf97a50bfee6ed027aca3eecbd",
            "meta": {}
          },
          {
            "content": "sha: 20e24015d82529c1889f5bed09adc69e51084392",
            "meta": {}
          },
          {
            "content": "baseUrl: https://github.com/tr8team/gotrade-infra",
            "meta": {}
          },
          {
            "content": "actionUrl: https://github.com/tr8team/gotrade-infra/actions/runs/4299735091",
            "meta": {}
          },
          {
            "content": "repoUrl: https://github.com/tr8team/gotrade-infra/tree/20e24015d82529c1889f5bed09adc69e51084392",
            "meta": {}
          },
          {
            "content": "org: tr8team",
            "meta": {}
          },
          {
            "content": "repo: gotrade-infra",
            "meta": {}
          },
        ]
      };

      const output = await emulateAction({
        relativePath: [...actionScripts, "context", "pull_request_event.ts"],
        context: {
          payloadPath: path.resolve(__dirname,"artifacts","context","pr.json"),
          sha: "5554225d82529c18ccf5bee09adc69e33084392",
          ref: "main",
          job: "Sample",
          runId: "4299735091",
          runNumber: "1",
          action: "ci/cd",
          eventName: "pull_request",
          workflow:"ci.yaml",
          actor:"ec2",
          repository: "tr8team/gotrade-infra",
        }
      }, f.emulate);

      output.should.deep.equal(expected);
    })

  });
  describe("push", function() {
    it("should correctly return all push values", async function() {
      const expected = {
        "debug": [
          {
            "content": "ref: refs/heads/main",
            "meta": {}
          },
          {
            "content": "shaAfter: dbadac870fad109420daf488c02646b945683e2e",
            "meta": {}
          },
          {
            "content": "shaBefore: d0943234e74a163bf6b99df47f86000c8dfa9e4e",
            "meta": {}
          },
          {
            "content": "sha: dbadac870fad109420daf488c02646b945683e2e",
            "meta": {}
          },
          {
            "content": "baseUrl: https://github.com/tr8team/gotrade-infra",
            "meta": {}
          },
          {
            "content": "actionUrl: https://github.com/tr8team/gotrade-infra/actions/runs/5589247332",
            "meta": {}
          },
          {
            "content": "repoUrl: https://github.com/tr8team/gotrade-infra/tree/dbadac870fad109420daf488c02646b945683e2e",
            "meta": {}
          },
          {
            "content": "org: tr8team",
            "meta": {}
          },
          {
            "content": "repo: gotrade-infra",
            "meta": {}
          },
        ]
      };

      const output = await emulateAction({
        relativePath: [...actionScripts, "context", "push_event.ts"],
        context: {
          payloadPath: path.resolve(__dirname,"artifacts","context","push.json"),
          sha: "daf488c02646b945683e2edbadac870fad109420",
          ref: "refs/heads/main",
          job: "Sample",
          runId: "5589247332",
          runNumber: "1",
          action: "ci/cd",
          eventName: "push",
          workflow:"ci.yaml",
          actor:"ec2",
          repository: "tr8team/gotrade-infra",
        }
      }, f.emulate);

      output.should.deep.equal(expected);
    })

  });

  describe("other", function() {
    it("should correctly return event values", async function() {
      const expected = {
        "debug": [
          {
            "content": `value: {"dummy":"true","age":4}`,
            "meta": {}
          },
          {
            "content": "sha: 20e24015d82529c1889f5bed09adc69e51084392",
            "meta": {}
          },
          {
            "content": "baseUrl: https://github.com/tr8team/harbor",
            "meta": {}
          },
          {
            "content": "actionUrl: https://github.com/tr8team/harbor/actions/runs/9920178",
            "meta": {}
          },
          {
            "content": "repoUrl: https://github.com/tr8team/harbor/tree/20e24015d82529c1889f5bed09adc69e51084392",
            "meta": {}
          },
          {
            "content": "org: tr8team",
            "meta": {}
          },
          {
            "content": "repo: harbor",
            "meta": {}
          },
        ]
      };
      const output = await emulateAction({
        relativePath: [...actionScripts, "context", "random_event.ts"],
        context: {
          payloadPath: path.resolve(__dirname,"artifacts","context","other.json"),
          sha: "20e24015d82529c1889f5bed09adc69e51084392",
          ref: "refs/heads/main",
          job: "Sample",
          runId: "9920178",
          runNumber: "1",
          action: "ci/cd",
          eventName: "tag",
          workflow:"ci.yaml",
          actor:"ec2",
          repository: "tr8team/harbor"
        }
      }, f.emulate);

      output.should.deep.equal(expected);
    });
  });


});
