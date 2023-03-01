import { chai, describe, expect, it, should } from "vitest";
import { HistoryService } from "../../src/lib/service.js";
import { anyString, anything, instance, mock, verify, when } from "ts-mockito";
import { KeyValueRepository } from "../../src/lib/interface/repo.js";
import { HistoryEntry, InputArray } from "../../src/lib/inputs.js";
import { None, Option, Some } from "../../src/lib/core/option.js";
import { Err, Ok } from "../../src/lib/core/result.js";
import { Inputs, PR } from "../../src/lib/interface/input-retriever.js";
// @ts-ignore
import helper from "../helper.js";
import { Output } from "../../src/lib/outputs.js";

should();

chai.use(helper);


describe("HistoryService", () => {


  describe("inputArrayToHistoryEntry", function() {
    let mockKV: KeyValueRepository = mock<KeyValueRepository>();
    let kv = instance(mockKV);
    const hs = new HistoryService(kv);
    // test cases
    const theory: {
      subject: {
        input: InputArray,
        sha: string,
        repoUrl: string,
        actionUrl: string,
      }, expected: HistoryEntry
    }[] = [
      // test case 1
      {
        subject: {
          sha: "1234567890",
          repoUrl: "http://localhost:8080",
          actionUrl: "http://localhost:8080/action/552/job/1234567890",
          input: [
            {
              url: "https://unit.test/ab123asdavr",
              data: {
                type: "test-coverage",
                line: 100,
                statement: 100,
                function: 100,
                branch: 100
              },
              name: "unitest"
            },
            {
              url: "https://integration.test/ab123asdavr",
              data: {
                type: "code-quality",
                qualityRating: "A"
              },
              name: "int test"
            }
          ]
        },
        expected: {
          sha: "1234567890",
          url: "http://localhost:8080",
          action: "http://localhost:8080/action/552/job/1234567890",
          items: [
            {
              url: "https://unit.test/ab123asdavr",
              data: {
                type: "test-coverage",
                line: 100,
                statement: 100,
                function: 100,
                branch: 100
              },
              name: "unitest"
            },
            {
              url: "https://integration.test/ab123asdavr",
              data: {
                type: "code-quality",
                qualityRating: "A"
              },
              name: "int test"
            }
          ]
        }

      },
      // test case 2
      {
        subject: {
          sha: "af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
          repoUrl: "https://github.com/tr8team/gotrade-indo",
          actionUrl: "https://github.com/tr8team/gotradeindo/actions/runs/4199943648/jobs/7285436552",
          input: [
            {
              url: "https://codecov.io/gh/tr8team/gotrade-indo/commit/af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
              data: {
                type: "test-coverage",
                line: 55,
                statement: 72,
                function: 100,
                branch: 100
              },
              name: "codecov"
            },
            {
              url: "https://goreportcard.com/report/github.com/tr8team/gotrade-indo",
              data: {
                type: "code-quality",
                qualityRating: "C-"
              },
              name: "goreportcard"
            },
            {
              url: "https://pkg.go.dev/github.com/tr8team/gotrade-indo",
              data: {
                type: "documentation"
              },
              name: "pkg.go.dev"
            }
          ]
        },
        expected: {
          sha: "af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
          url: "https://github.com/tr8team/gotrade-indo",
          action: "https://github.com/tr8team/gotradeindo/actions/runs/4199943648/jobs/7285436552",
          items: [
            {
              url: "https://codecov.io/gh/tr8team/gotrade-indo/commit/af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
              data: {
                type: "test-coverage",
                line: 55,
                statement: 72,
                function: 100,
                branch: 100
              },
              name: "codecov"
            },
            {
              url: "https://goreportcard.com/report/github.com/tr8team/gotrade-indo",
              data: {
                type: "code-quality",
                qualityRating: "C-"
              },
              name: "goreportcard"
            },
            {
              url: "https://pkg.go.dev/github.com/tr8team/gotrade-indo",
              data: {
                type: "documentation"
              },
              name: "pkg.go.dev"
            }
          ]
        }
      },
      {
        subject: {
          sha: "d8b07f19e7f0c65c1ecaf743f8b9d9bcb67ca51d",
          repoUrl: "https://github.com/OpenAI/gpt-3",
          actionUrl: "https://github.com/OpenAI/gpt-3/actions/runs/123456789",
          input: [
            {
              url: "https://coveralls.io/builds/12345678",
              data: {
                type: "test-coverage",
                line: 90,
                statement: 95,
                function: 98,
                branch: 85
              },
              name: "coveralls"
            },
            {
              url: "https://sonarcloud.io/dashboard?id=OpenAI_gpt-3",
              data: {
                type: "code-quality",
                qualityRating: "A"
              },
              name: "sonarcloud"
            }
          ]
        },
        expected: {
          sha: "d8b07f19e7f0c65c1ecaf743f8b9d9bcb67ca51d",
          url: "https://github.com/OpenAI/gpt-3",
          action: "https://github.com/OpenAI/gpt-3/actions/runs/123456789",
          items: [
            {
              url: "https://coveralls.io/builds/12345678",
              data: {
                type: "test-coverage",
                line: 90,
                statement: 95,
                function: 98,
                branch: 85
              },
              name: "coveralls"
            },
            {
              url: "https://sonarcloud.io/dashboard?id=OpenAI_gpt-3",
              data: {
                type: "code-quality",
                qualityRating: "A"
              },
              name: "sonarcloud"
            }
          ]
        }
      },
      {
        subject: {
          sha: "abcde12345",
          repoUrl: "https://github.com/my-org/my-repo",
          actionUrl: "https://github.com/my-org/my-repo/actions/runs/111222333",
          input: [
            {
              url: "https://example.com/unit-tests",
              data: {
                type: "test-coverage",
                line: 80,
                statement: 75,
                function: 90,
                branch: 95
              },
              name: "unit-tests"
            },
            {
              url: "https://example.com/linting",
              data: {
                type: "code-quality",
                qualityRating: "B"
              },
              name: "linting"
            }
          ]
        },
        expected: {
          sha: "abcde12345",
          url: "https://github.com/my-org/my-repo",
          action: "https://github.com/my-org/my-repo/actions/runs/111222333",
          items: [
            {
              url: "https://example.com/unit-tests",
              data: {
                type: "test-coverage",
                line: 80,
                statement: 75,
                function: 90,
                branch: 95
              },
              name: "unit-tests"
            },
            {
              url: "https://example.com/linting",
              data: {
                type: "code-quality",
                qualityRating: "B"
              },
              name: "linting"
            }
          ]
        }
      }
    ];


    theory.forEach(({ subject, expected }) => {
      it("should return a HistoryEntry given input array, sha, repoUrl and actionUrl", function() {
        hs.inputArrayToHistoryEntry(subject.input, subject.sha, subject.repoUrl, subject.actionUrl).should.deep.equal(expected);
      });
    });
  });


  describe("getBaseSHA", function() {

    let mockKV: KeyValueRepository = mock<KeyValueRepository>();

    when(mockKV.read<HistoryEntry>("crm-89ce91b45b9ebb01a694049e7f74912266514de7-commit.json"))
      .thenReturn(Ok(Some({
        sha: "af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
        url: "https://github.com/tr8team/gotrade-indo",
        action: "https://github.com/tr8team/gotradeindo/actions/runs/4199943648/jobs/7285436552",
        items: [
          {
            url: "https://codecov.io/gh/tr8team/gotrade-indo/commit/af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
            data: {
              type: "test-coverage",
              line: 55,
              statement: 72,
              function: 100,
              branch: 100
            },
            name: "codecov"
          },
          {
            url: "https://goreportcard.com/report/github.com/tr8team/gotrade-indo",
            data: {
              type: "code-quality",
              qualityRating: "C-"
            },
            name: "goreportcard"
          },
          {
            url: "https://pkg.go.dev/github.com/tr8team/gotrade-indo",
            data: {
              type: "documentation"
            },
            name: "pkg.go.dev"
          }
        ]
      })));

    when(mockKV.read<HistoryEntry>("crm-a2fb14cd0012af0cd2b5b1b5b4b9b1b5b4b9b1b5-commit.json"))
      .thenReturn(Ok(None()));

    when(mockKV.read<HistoryEntry>("crm-92c7ef0aae1b5b4b9b1b5b4b9b1b5b4b9b1b5b4-commit.json"))
      .thenReturn(Err(new Error("random error")));

    let kv = instance(mockKV);
    const hs = new HistoryService(kv);

    it("should return Ok Result of None if nothing is found", async function() {
      // Arrange
      const prefix = "crm-";
      const pr: PR = {
        number: 5,
        baseSha: "89ce91b45b9ebb01a694049e7f74912266514de7"
      };
      const expected = Ok(Some({
        sha: "af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
        url: "https://github.com/tr8team/gotrade-indo",
        action: "https://github.com/tr8team/gotradeindo/actions/runs/4199943648/jobs/7285436552",
        items: [
          {
            url: "https://codecov.io/gh/tr8team/gotrade-indo/commit/af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
            data: {
              type: "test-coverage",
              line: 55,
              statement: 72,
              function: 100,
              branch: 100
            },
            name: "codecov"
          },
          {
            url: "https://goreportcard.com/report/github.com/tr8team/gotrade-indo",
            data: {
              type: "code-quality",
              qualityRating: "C-"
            },
            name: "goreportcard"
          },
          {
            url: "https://pkg.go.dev/github.com/tr8team/gotrade-indo",
            data: {
              type: "documentation"
            },
            name: "pkg.go.dev"
          }
        ]
      }));

      // Act
      const act = hs.getBaseSHA(prefix, pr);

      // Assert
      await act.should.be.congruent(expected);

    });

    it("should return Ok Result of the HistoryEntry if something is found", async function() {
      // Arrange
      const prefix = "crm-";
      const pr: PR = {
        number: 12,
        baseSha: "a2fb14cd0012af0cd2b5b1b5b4b9b1b5b4b9b1b5"
      };
      const expected = Ok(None());

      // Act
      const act = hs.getBaseSHA(prefix, pr);

      // Assert
      await act.should.be.congruent(expected);
    });

    it("should return Error if an error occurs", async function() {
      // Arrange
      const prefix = "crm-";
      const pr: PR = {
        number: 8,
        baseSha: "92c7ef0aae1b5b4b9b1b5b4b9b1b5b4b9b1b5b4"
      };
      const expected = "random error";

      // Act
      const act = hs.getBaseSHA(prefix, pr);

      // Assert
      await act.should.have.errErrorMessage(expected);
    });

  });

  describe("writeSHA", function() {
    let mockKV: KeyValueRepository = mock<KeyValueRepository>();

    when(mockKV.write("wringler_89ce91b45b9ebb01a694049e7f74912266514de7-commit.json", anything()))
      .thenReturn(None());

    when(mockKV.write("wringler_a2fb14cd0012af0cd2b5b1b5b4b9b1b5b4b9b1b5-commit.json", anything()))
      .thenReturn(Some(new Error("pew pew boom")));


    let kv = instance(mockKV);
    const hs = new HistoryService(kv);

    it("should return Ok(null) if there are not errors with the KV storage", async function() {
      // arrange
      const prefix = "wringler_";
      const sha = "89ce91b45b9ebb01a694049e7f74912266514de7";
      const historyEntry: HistoryEntry = {
        sha: "af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
        url: "https://github.com/wringler/wringler",
        items: [],
        action: "https://github.com/w/w/action/123/run/54341"
      };
      // act
      const act = hs.writeSHA(prefix, sha, historyEntry);

      // assert
      await act.should.be.congruent(Ok(null));


    });

    it("should return Err if there are errors with the KV storage", async function() {
      const prefix = "wringler_";
      const sha = "a2fb14cd0012af0cd2b5b1b5b4b9b1b5b4b9b1b5";
      const historyEntry: HistoryEntry = {
        sha: "af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
        url: "https://github.com/wringler/wringler",
        items: [],
        action: "https://github.com/w/w/action/123/run/54341"
      };
      // act
      const act = hs.writeSHA(prefix, sha, historyEntry);

      // assert
      await act.should.have.errErrorMessage("pew pew boom");
    });

  });

  describe("writePR", function() {

    let mockKV: KeyValueRepository = mock<KeyValueRepository>();

    when(mockKV.read<HistoryEntry[]>("astrovault-72-pr.json"))
      .thenReturn(Ok(Some([{
        sha: "af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
        url: "https://github.com/tr8team/gotrade-indo",
        action: "https://github.com/tr8team/gotradeindo/actions/runs/4199943648/jobs/7285436552",
        items: [
          {
            url: "https://codecov.io/gh/tr8team/gotrade-indo/commit/af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
            data: {
              type: "test-coverage",
              line: 55,
              statement: 72,
              function: 100,
              branch: 100
            },
            name: "codecov"
          },
          {
            url: "https://goreportcard.com/report/github.com/tr8team/gotrade-indo",
            data: {
              type: "code-quality",
              qualityRating: "C-"
            },
            name: "goreportcard"
          },
          {
            url: "https://pkg.go.dev/github.com/tr8team/gotrade-indo",
            data: {
              type: "documentation"
            },
            name: "pkg.go.dev"
          }
        ]
      }])));

    when(mockKV.write<HistoryEntry>("astrovault-72-pr.json", anything()))
      .thenReturn(None());

    when(mockKV.read<HistoryEntry[]>("astrovault-12-pr.json"))
      .thenReturn(Ok(None()));

    when(mockKV.write<HistoryEntry>("astrovault-12-pr.json", anything()))
      .thenReturn(None());

    when(mockKV.read<HistoryEntry[]>("astrovault-3-pr.json"))
      .thenReturn(Err(new Error("explosive read error!!!")));

    when(mockKV.write<HistoryEntry>("astrovault-3-pr.json", anything()))
      .thenReturn(None());

    when(mockKV.read<HistoryEntry[]>("astrovault-91-pr.json"))
      .thenReturn(Ok(Some([{
        sha: "af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
        url: "https://github.com/tr8team/gotrade-indo",
        action: "https://github.com/tr8team/gotradeindo/actions/runs/4199943648/jobs/7285436552",
        items: [
          {
            url: "https://codecov.io/gh/tr8team/gotrade-indo/commit/af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
            data: {
              type: "test-coverage",
              line: 55,
              statement: 72,
              function: 100,
              branch: 100
            },
            name: "codecov"
          },
          {
            url: "https://goreportcard.com/report/github.com/tr8team/gotrade-indo",
            data: {
              type: "code-quality",
              qualityRating: "C-"
            },
            name: "goreportcard"
          },
          {
            url: "https://pkg.go.dev/github.com/tr8team/gotrade-indo",
            data: {
              type: "documentation"
            },
            name: "pkg.go.dev"
          }
        ]
      }])));

    when(mockKV.write<HistoryEntry>("astrovault-91-pr.json", anything()))
      .thenReturn(Some(new Error("explosive write error!!!")));

    when(mockKV.read<HistoryEntry[]>("astrovault-151-pr.json"))
      .thenReturn(Ok(None()));

    when(mockKV.write<HistoryEntry>("astrovault-151-pr.json", anything()))
      .thenReturn(Some(new Error("explosive write error!!! v2")));

    when(mockKV.read<HistoryEntry[]>("astrovault-77-pr.json"))
      .thenReturn(Err(new Error("explosive read error!!! double trouble")));

    when(mockKV.write<HistoryEntry>("astrovault-77-pr.json", anything()))
      .thenReturn(Some(new Error("explosive write error!!! double trouble")));

    let kv = instance(mockKV);
    const hs = new HistoryService(kv);

    it("should return error if KV store returns error at read", async function() {
      // arrange
      const prefix = "astrovault-";
      const pr: PR = {
        number: 3,
        baseSha: "kv81j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a"
      };
      const historyEntry: HistoryEntry = {
        sha: "7f8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t",
        url: "https://github.com/wringler/wringler",
        items: [],
        action: "https://github.com/w/w/action/123/run/54341"
      };
      // act
      const act = await hs.writePR(prefix, pr, historyEntry);

      // assert
      const expected = Err(new Error("explosive read error!!!"));

      await act.should.be.congruent(expected);


    });

    it("should return error if KV store returns error at write with non-empty read", async function() {
      // arrange
      const prefix = "astrovault-";
      const pr: PR = {
        number: 91,
        baseSha: "zro91kvn1b02020a0a0a0a0a0a0a0a0a0a0a0a0a"
      };
      const historyEntry: HistoryEntry = {
        sha: "7f8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t",
        url: "https://github.com/wringler/wringler",
        items: [],
        action: "https://github.com/w/w/action/123/run/54341"
      };
      // act
      const act = hs.writePR(prefix, pr, historyEntry);

      // assert
      const expected = Err(new Error("explosive write error!!!"));

      await act.should.be.congruent(expected);
    });

    it("should return error if KV store returns error at write with empty read", async function() {
      // arrange
      const prefix = "astrovault-";
      const pr: PR = {
        number: 151,
        baseSha: "1092aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6"
      };
      const historyEntry: HistoryEntry = {
        sha: "7f8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t",
        url: "https://github.com/wringler/wringler",
        items: [],
        action: "https://github.com/w/w/action/123/run/54341"
      };
      // act
      const act = hs.writePR(prefix, pr, historyEntry);

      // assert
      const expected = Err(new Error("explosive write error!!! v2"));

      await act.should.be.congruent(expected);
    });

    it("should return error if KV store returns error at read and write", async function() {
      // arrange
      const prefix = "astrovault-";
      const pr: PR = {
        number: 77,
        baseSha: "992aytq3a2e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6"
      };
      const historyEntry: HistoryEntry = {
        sha: "33a01e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v",
        url: "https://github.com/wringler/wringler",
        items: [],
        action: "https://github.com/w/w/action/123/run/54341"
      };
      // act
      const act = hs.writePR(prefix, pr, historyEntry);

      // assert
      const expected = Err(new Error("explosive read error!!! double trouble"));

      await act.should.be.congruent(expected);
    });

    it("should return empty before with new entry in after if previous history is empty", async function() {

      // arrange
      const prefix = "astrovault-";
      const pr: PR = {
        number: 12,
        baseSha: "ooau12vz91e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6"
      };
      const historyEntry: HistoryEntry = {
        sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
        url: "https://github.com/wringler/wringler",
        items: [],
        action: "https://github.com/w/w/action/123/run/54341"
      };

      // act
      const act = hs.writePR(prefix, pr, historyEntry);

      // arrange
      const expected = Ok({
        preImage: [],
        afterImage: [
          {
            sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
            url: "https://github.com/wringler/wringler",
            items: [],
            action: "https://github.com/w/w/action/123/run/54341"
          }
        ]
      });

      await act.should.be.congruent(expected);

    });

    it("should return previous history as pre image and new history as after image", async function() {

      // arrange
      const prefix = "astrovault-";
      const pr: PR = {
        number: 72,
        baseSha: "hew87alvz91e2f3g4h5ibbb31a0a0a0a0a0a0a0a"
      };
      const historyEntry: HistoryEntry = {
        sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
        url: "https://github.com/wringler/wringler",
        items: [],
        action: "https://github.com/w/w/action/123/run/54341"
      };

      // act
      const act = hs.writePR(prefix, pr, historyEntry);

      // assert
      const expected = Ok({
        preImage: [
          {
            sha: "af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
            url: "https://github.com/tr8team/gotrade-indo",
            action: "https://github.com/tr8team/gotradeindo/actions/runs/4199943648/jobs/7285436552",
            items: [
              {
                url: "https://codecov.io/gh/tr8team/gotrade-indo/commit/af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
                data: {
                  type: "test-coverage",
                  line: 55,
                  statement: 72,
                  function: 100,
                  branch: 100
                },
                name: "codecov"
              },
              {
                url: "https://goreportcard.com/report/github.com/tr8team/gotrade-indo",
                data: {
                  type: "code-quality",
                  qualityRating: "C-"
                },
                name: "goreportcard"
              },
              {
                url: "https://pkg.go.dev/github.com/tr8team/gotrade-indo",
                data: {
                  type: "documentation"
                },
                name: "pkg.go.dev"
              }
            ]
          }
        ],
        afterImage: [
          {
            sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
            url: "https://github.com/wringler/wringler",
            items: [],
            action: "https://github.com/w/w/action/123/run/54341"
          },
          {
            sha: "af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
            url: "https://github.com/tr8team/gotrade-indo",
            action: "https://github.com/tr8team/gotradeindo/actions/runs/4199943648/jobs/7285436552",
            items: [
              {
                url: "https://codecov.io/gh/tr8team/gotrade-indo/commit/af5e9bdd23b9b1b5b4b9b1b5b4b9b1b5b4b9b1b5",
                data: {
                  type: "test-coverage",
                  line: 55,
                  statement: 72,
                  function: 100,
                  branch: 100
                },
                name: "codecov"
              },
              {
                url: "https://goreportcard.com/report/github.com/tr8team/gotrade-indo",
                data: {
                  type: "code-quality",
                  qualityRating: "C-"
                },
                name: "goreportcard"
              },
              {
                url: "https://pkg.go.dev/github.com/tr8team/gotrade-indo",
                data: {
                  type: "documentation"
                },
                name: "pkg.go.dev"
              }
            ]
          }
        ]
      });
      await act.should.be.congruent(expected);
    });

  });

  describe("buildOutput", function() {
    let mockKV: KeyValueRepository = mock<KeyValueRepository>();
    let kv = instance(mockKV);
    const hs = new HistoryService(kv);

    it("should merge current, update and baseRef if baseRef is Some", async function() {
      // arrange
      const current: HistoryEntry = {
        sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
        url: "https://google.com",
        action: "https://action.com",
        items: []
      };

      const update = {
        preImage: [],
        afterImage: [
          {
            sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
            url: "https://google.com",
            action: "https://action.com",
            items: []
          }
        ]
      };

      const base: Option<HistoryEntry> = Some({
        sha: "zzsy771900apslonbhsduueui188a7kkanahckja",
        url: "https://base.com",
        action: "https://base.com/run/112/adsds/0918772",
        items: [
          {
            name: "unit",
            url: "https://base.com/run/112/adsds/0918772",
            data: {
              type: "test-coverage",
              line: 100,
              statement: 100,
              function: 100,
              branch: 100
            }
          }
        ]
      });

      // act
      const act = await hs.buildOutput(current, update, base);

      // assert

      const expect: Output = {
        preImage: [],
        afterImage: [
          {
            sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
            url: "https://google.com",
            action: "https://action.com",
            items: []
          }
        ],
        base: {
          sha: "zzsy771900apslonbhsduueui188a7kkanahckja",
          url: "https://base.com",
          action: "https://base.com/run/112/adsds/0918772",
          items: [
            {
              name: "unit",
              url: "https://base.com/run/112/adsds/0918772",
              data: {
                type: "test-coverage",
                line: 100,
                statement: 100,
                function: 100,
                branch: 100
              }
            }
          ]
        },
        current: {
          sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
          url: "https://google.com",
          action: "https://action.com",
          items: []
        }
      };

      await act.should.be.congruent(expect);

    });

    it("should merge current, update and baseRef if baseRef is None", async function() {
      // arrange
      const current: HistoryEntry = {
        sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
        url: "https://google.com",
        action: "https://action.com",
        items: []
      };

      const update = {
        preImage: [],
        afterImage: [
          {
            sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
            url: "https://google.com",
            action: "https://action.com",
            items: []
          }
        ]
      };

      const base: Option<HistoryEntry> = None();

      // act
      const act = await hs.buildOutput(current, update, base);

      // assert

      const expect: Output = {
        preImage: [],
        afterImage: [
          {
            sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
            url: "https://google.com",
            action: "https://action.com",
            items: []
          }
        ],
        current: {
          sha: "bb8910aznjs2e2f3g4h5i6j7k8l9m0n1o2p3q4r5",
          url: "https://google.com",
          action: "https://action.com",
          items: []
        }
      };

      await act.should.be.congruent(expect);
    });

  });

  describe("store", function() {

    describe("PR", function() {

      describe("empty history with base commit", async function() {

        // Mocks
        let mockKV: KeyValueRepository = mock<KeyValueRepository>();
        let stateTracker: Partial<{
          commitWrite: HistoryEntry,
          prWrite: HistoryEntry[],
        }> = {};

        // mock base commit
        when(mockKV.read<HistoryEntry>("obsidianTracks$zkj8167anm1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6-commit.json"))
          .thenReturn(Ok(Some({
            sha: "zkj8167anm1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6",
            url: "https://google.com",
            action: "https://action.com",
            items: []
          })));

        // write single commit
        when(mockKV.write<HistoryEntry>("obsidianTracks$895103ab0c75b86ed57f84424937eb9003a65c6e-commit.json", anything()))
          .thenCall((_, b: HistoryEntry) => {
            stateTracker.commitWrite = b;
            return None();
          });

        // mock read pr history
        when(mockKV.read<HistoryEntry[]>("obsidianTracks$15-pr.json"))
          .thenReturn(Ok(None()));

        // mock write pr history
        when(mockKV.write<HistoryEntry[]>("obsidianTracks$15-pr.json", anything()))
          .thenCall((_, b: HistoryEntry[]) => {
            stateTracker.prWrite = b;
            return None();
          });

        let kv = instance(mockKV);
        const hs = new HistoryService(kv);

        // arrange
        const inputs: Inputs = {
          sha: "895103ab0c75b86ed57f84424937eb9003a65c6e",
          data: [
            {
              url: "https://base.com/run/112/adsds/0918772",
              data: {
                type: "documentation"
              },
              name: "Run docs"
            }
          ],
          pr: Some({
            baseSha: "zkj8167anm1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6",
            number: 15
          }),
          actionUrl: "https://github.com/vitest-dev/vitest/actions/runs/4288149762",
          repoUrl: "https://github.com/vitest-dev/vitest",
          prefix: "obsidianTracks$"
        };
        const act = hs.store(inputs);
        // force eval
        await act.native();

        it("should succeed", function() {
          act.should.be.ok;
        });

        it("should write to commit history", async function() {
          const expected: HistoryEntry = {
            sha: "895103ab0c75b86ed57f84424937eb9003a65c6e",
            url: "https://github.com/vitest-dev/vitest",
            action: "https://github.com/vitest-dev/vitest/actions/runs/4288149762",
            items: [
              {
                url: "https://base.com/run/112/adsds/0918772",
                data: {
                  type: "documentation"
                },
                name: "Run docs"
              }
            ]
          };

          // act
          verify(mockKV.write("obsidianTracks$895103ab0c75b86ed57f84424937eb9003a65c6e-commit.json", anything()))
            .once();
          expect(stateTracker.commitWrite).to.not.be.null;
          await stateTracker.commitWrite?.should.be.congruent(expected);
        });

        it("should create new PR history", async function() {

          const expected: HistoryEntry[] = [
            {
              sha: "895103ab0c75b86ed57f84424937eb9003a65c6e",
              url: "https://github.com/vitest-dev/vitest",
              action: "https://github.com/vitest-dev/vitest/actions/runs/4288149762",
              items: [
                {
                  url: "https://base.com/run/112/adsds/0918772",
                  data: {
                    type: "documentation"
                  },
                  name: "Run docs"
                }
              ]
            }
          ];

          // act
          verify(mockKV.read("obsidianTracks$15-pr.json"))
            .once();
          verify(mockKV.write("obsidianTracks$15-pr.json", anything()))
            .once();
          expect(stateTracker.prWrite).to.not.be.null;
          await stateTracker.prWrite?.should.be.congruent(expected);
        });

        it("should return prev and new history", async function() {
          const expected = [
            {
              sha: "895103ab0c75b86ed57f84424937eb9003a65c6e",
              url: "https://github.com/vitest-dev/vitest",
              action: "https://github.com/vitest-dev/vitest/actions/runs/4288149762",
              items: [
                {
                  url: "https://base.com/run/112/adsds/0918772",
                  data: {
                    type: "documentation"
                  },
                  name: "Run docs"
                }
              ]
            }
          ];
          // act
          const a = await act.unwrap();
          expect(a.preImage).to.not.be.null;
          expect(a.afterImage).to.not.be.null;
          await a.preImage?.should.be.congruent([]);
          await a.afterImage?.should.be.congruent(expected);
        });

        it("should return current commit entry", async function() {
          const expected =
            {
              sha: "895103ab0c75b86ed57f84424937eb9003a65c6e",
              url: "https://github.com/vitest-dev/vitest",
              action: "https://github.com/vitest-dev/vitest/actions/runs/4288149762",
              items: [
                {
                  url: "https://base.com/run/112/adsds/0918772",
                  data: {
                    type: "documentation"
                  },
                  name: "Run docs"
                }
              ]
            };


          // act
          const a = await act.unwrap();
          expect(a.current).to.not.be.null;
          await a.current?.should.be.congruent(expected);
        });

        it("should return base commit entry", async function() {
          const expected = {
            sha: "zkj8167anm1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6",
            url: "https://google.com",
            action: "https://action.com",
            items: []
          };

          // act
          const a = await act.unwrap();
          expect(a.base).to.not.be.null;
          await a.base?.should.be.congruent(expected);
        });

      });

      describe("full history with base commit", async function() {
        // Mocks
        let mockKV: KeyValueRepository = mock<KeyValueRepository>();
        let stateTracker: Partial<{
          commitWrite: HistoryEntry,
          prWrite: HistoryEntry[],
        }> = {};

        // mock base commit
        when(mockKV.read<HistoryEntry>("cypress-configs+a9f5af379f25bf5f8d55f2fd5896f40f3cc482e8-commit.json"))
          .thenReturn(Ok(Some({
            sha: "a9f5af379f25bf5f8d55f2fd5896f40f3cc482e8",
            url: "https://yahoo.com",
            action: "https://code.dev",
            items: [
              {
                url: "https://codalytics.code/run/111/adsds/0918771",
                data: {
                  type: "code-quality",
                  qualityRating: "Bad"
                },
                name: "Codalytics"
              }
            ]
          })));

        // write single commit
        when(mockKV.write<HistoryEntry>("cypress-configs+2ea5058ae921d3d4e645f5977327aff50b8ac953-commit.json", anything()))
          .thenCall((_, b: HistoryEntry) => {
            stateTracker.commitWrite = b;
            return None();
          });

        // mock read pr history
        when(mockKV.read<HistoryEntry[]>("cypress-configs+1021-pr.json"))
          .thenReturn(Ok(Some([
            {
              sha: "fddef5844027e72902f84c995c5d048cdb6d95d3",
              url: "https://yahoo.com",
              action: "https://code.dev/111",
              items: [
                {
                  url: "https://codalytics.code/run/111/adsds/0918770",
                  data: {
                    type: "code-quality",
                    qualityRating: "Bad"
                  },
                  name: "Codalytics"
                }
              ]
            },
            {
              sha: "bc0b9737ccaf1c7179ba30f5e26f26544aaa9622",
              url: "https://yahoo.com",
              action: "https://code.dev/110",
              items: [
                {
                  url: "https://codalytics.code/run/110/adsds/0918770",
                  data: {
                    type: "code-quality",
                    qualityRating: "Fail"
                  },
                  name: "Codalytics"
                }
              ]
            }

          ])));

        // mock write pr history
        when(mockKV.write<HistoryEntry[]>("cypress-configs+1021-pr.json", anything()))
          .thenCall((_, b: HistoryEntry[]) => {
            stateTracker.prWrite = b;
            return None();
          });

        let kv = instance(mockKV);
        const hs = new HistoryService(kv);

        // arrange
        const inputs: Inputs = {
          sha: "2ea5058ae921d3d4e645f5977327aff50b8ac953",
          data: [
            {
              url: "https://codalytics.code/run/112/adsds/0918772",
              data: {
                type: "code-quality",
                qualityRating: "Good"
              },
              name: "Codalytics"
            }
          ],
          pr: Some({
            baseSha: "a9f5af379f25bf5f8d55f2fd5896f40f3cc482e8",
            number: 1021
          }),
          actionUrl: "https://github.com/cypress/config/actions/runs/885697123",
          repoUrl: "https://github.com/cypress/config",
          prefix: "cypress-configs+"
        };

        const act = hs.store(inputs);

        // force eval
        await act.native();

        it("should succeed", async function() {
          await act.should.be.ok;
        });

        it("should write to commit history", async function() {
          const expected: HistoryEntry = {
            sha: "2ea5058ae921d3d4e645f5977327aff50b8ac953",
            url: "https://github.com/cypress/config",
            action: "https://github.com/cypress/config/actions/runs/885697123",
            items: [
              {
                url: "https://codalytics.code/run/112/adsds/0918772",
                data: {
                  type: "code-quality",
                  qualityRating: "Good"
                },
                name: "Codalytics"
              }
            ]
          };

          // act
          verify(mockKV.write("cypress-configs+2ea5058ae921d3d4e645f5977327aff50b8ac953-commit.json", anything()))
            .once();
          expect(stateTracker.commitWrite).to.not.be.null;
          await stateTracker.commitWrite?.should.be.congruent(expected);
        });

        it("should append to PR history", async function() {
          const expected: HistoryEntry[] = [
            {
              sha: "2ea5058ae921d3d4e645f5977327aff50b8ac953",
              url: "https://github.com/cypress/config",
              action: "https://github.com/cypress/config/actions/runs/885697123",
              items: [
                {
                  url: "https://codalytics.code/run/112/adsds/0918772",
                  data: {
                    type: "code-quality",
                    qualityRating: "Good"
                  },
                  name: "Codalytics"
                }
              ]
            },
            {
              sha: "fddef5844027e72902f84c995c5d048cdb6d95d3",
              url: "https://yahoo.com",
              action: "https://code.dev/111",
              items: [
                {
                  url: "https://codalytics.code/run/111/adsds/0918770",
                  data: {
                    type: "code-quality",
                    qualityRating: "Bad"
                  },
                  name: "Codalytics"
                }
              ]
            },
            {
              sha: "bc0b9737ccaf1c7179ba30f5e26f26544aaa9622",
              url: "https://yahoo.com",
              action: "https://code.dev/110",
              items: [
                {
                  url: "https://codalytics.code/run/110/adsds/0918770",
                  data: {
                    type: "code-quality",
                    qualityRating: "Fail"
                  },
                  name: "Codalytics"
                }
              ]
            }
          ];

          verify(mockKV.read("cypress-configs+1021-pr.json"))
            .once();
          verify(mockKV.write("cypress-configs+1021-pr.json", anything()))
            .once();
          expect(stateTracker.prWrite).to.not.be.null;
          await stateTracker.prWrite?.should.be.congruent(expected);

        });

        it("should return prev and new history", async function() {
          const preImageExpected = [
            {
              sha: "fddef5844027e72902f84c995c5d048cdb6d95d3",
              url: "https://yahoo.com",
              action: "https://code.dev/111",
              items: [
                {
                  url: "https://codalytics.code/run/111/adsds/0918770",
                  data: {
                    type: "code-quality",
                    qualityRating: "Bad"
                  },
                  name: "Codalytics"
                }
              ]
            },
            {
              sha: "bc0b9737ccaf1c7179ba30f5e26f26544aaa9622",
              url: "https://yahoo.com",
              action: "https://code.dev/110",
              items: [
                {
                  url: "https://codalytics.code/run/110/adsds/0918770",
                  data: {
                    type: "code-quality",
                    qualityRating: "Fail"
                  },
                  name: "Codalytics"
                }
              ]
            }
          ];
          const postImageExpected = [
            {
              sha: "2ea5058ae921d3d4e645f5977327aff50b8ac953",
              url: "https://github.com/cypress/config",
              action: "https://github.com/cypress/config/actions/runs/885697123",
              items: [
                {
                  url: "https://codalytics.code/run/112/adsds/0918772",
                  data: {
                    type: "code-quality",
                    qualityRating: "Good"
                  },
                  name: "Codalytics"
                }
              ]
            },
            {
              sha: "fddef5844027e72902f84c995c5d048cdb6d95d3",
              url: "https://yahoo.com",
              action: "https://code.dev/111",
              items: [
                {
                  url: "https://codalytics.code/run/111/adsds/0918770",
                  data: {
                    type: "code-quality",
                    qualityRating: "Bad"
                  },
                  name: "Codalytics"
                }
              ]
            },
            {
              sha: "bc0b9737ccaf1c7179ba30f5e26f26544aaa9622",
              url: "https://yahoo.com",
              action: "https://code.dev/110",
              items: [
                {
                  url: "https://codalytics.code/run/110/adsds/0918770",
                  data: {
                    type: "code-quality",
                    qualityRating: "Fail"
                  },
                  name: "Codalytics"
                }
              ]
            }
          ];
          // act
          const a = await act.unwrap();
          expect(a.preImage).to.not.be.null;
          expect(a.afterImage).to.not.be.null;
          await a.preImage?.should.be.congruent(preImageExpected);
          await a.afterImage?.should.be.congruent(postImageExpected);
        });

        it("should return current commit entry", async function() {
          const expected =
            {
              sha: "2ea5058ae921d3d4e645f5977327aff50b8ac953",
              url: "https://github.com/cypress/config",
              action: "https://github.com/cypress/config/actions/runs/885697123",
              items: [
                {
                  url: "https://codalytics.code/run/112/adsds/0918772",
                  data: {
                    type: "code-quality",
                    qualityRating: "Good"
                  },
                  name: "Codalytics"
                }
              ]
            };


          // act
          const a = await act.unwrap();
          expect(a.current).to.not.be.null;
          await a.current?.should.be.congruent(expected);
        });

        it("should return base commit entry", async function() {
          const expected = {
            sha: "a9f5af379f25bf5f8d55f2fd5896f40f3cc482e8",
            url: "https://yahoo.com",
            action: "https://code.dev",
            items: [
              {
                url: "https://codalytics.code/run/111/adsds/0918771",
                data: {
                  type: "code-quality",
                  qualityRating: "Bad"
                },
                name: "Codalytics"
              }
            ]
          };

          // act
          const a = await act.unwrap();
          expect(a.base).to.not.be.null;
          await a.base?.should.be.congruent(expected);
        });
      });

      describe("empty history without base commit", async function() {

        // Mocks
        let mockKV: KeyValueRepository = mock<KeyValueRepository>();
        let stateTracker: Partial<{
          commitWrite: HistoryEntry,
          prWrite: HistoryEntry[],
        }> = {};

        // mock base commit
        when(mockKV.read<HistoryEntry>("infra_168464800efaf0d49c9c2845dce1afaf556414a7-commit.json"))
          .thenReturn(Ok(None()));

        // write single commit
        when(mockKV.write<HistoryEntry>("infra_6136bd84a4052d2d109fcbee25b60f09b2116150-commit.json", anything()))
          .thenCall((_, b: HistoryEntry) => {
            stateTracker.commitWrite = b;
            return None();
          });

        // mock read pr history
        when(mockKV.read<HistoryEntry[]>("infra_5-pr.json"))
          .thenReturn(Ok(None()));

        // mock write pr history
        when(mockKV.write<HistoryEntry[]>("infra_5-pr.json", anything()))
          .thenCall((_, b: HistoryEntry[]) => {
            stateTracker.prWrite = b;
            return None();
          });

        let kv = instance(mockKV);
        const hs = new HistoryService(kv);

        // arrange
        const inputs: Inputs = {
          sha: "6136bd84a4052d2d109fcbee25b60f09b2116150",
          data: [
            {
              url: "https://infra.site/docs/100",
              data: {
                type: "test-coverage",
                line: 8,
                branch: 72,
                function: 91,
                statement: 25
              },
              name: "infra documentation"
            }
          ],
          pr: Some({
            baseSha: "168464800efaf0d49c9c2845dce1afaf556414a7",
            number: 5
          }),
          actionUrl: "https://github.com/foodpanda/infra/actions/runs/4288149762",
          repoUrl: "https://github.com/foodpanda/infra",
          prefix: "infra_"
        };
        const act = hs.store(inputs);
        // force eval
        await act.native();

        it("should succeed", function() {
          act.should.be.ok;
        });

        it("should write to commit history", async function() {
          const expected: HistoryEntry = {
            sha: "6136bd84a4052d2d109fcbee25b60f09b2116150",
            url: "https://github.com/foodpanda/infra",
            action: "https://github.com/foodpanda/infra/actions/runs/4288149762",
            items: [
              {
                url: "https://infra.site/docs/100",
                data: {
                  type: "test-coverage",
                  line: 8,
                  branch: 72,
                  function: 91,
                  statement: 25
                },
                name: "infra documentation"
              }
            ]
          };

          // act
          verify(mockKV.write("infra_6136bd84a4052d2d109fcbee25b60f09b2116150-commit.json", anything()))
            .once();
          expect(stateTracker.commitWrite).to.not.be.null;
          await stateTracker.commitWrite?.should.be.congruent(expected);
        });

        it("should create new PR history", async function() {

          const expected: HistoryEntry[] = [
            {
              sha: "6136bd84a4052d2d109fcbee25b60f09b2116150",
              url: "https://github.com/foodpanda/infra",
              action: "https://github.com/foodpanda/infra/actions/runs/4288149762",
              items: [
                {
                  url: "https://infra.site/docs/100",
                  data: {
                    type: "test-coverage",
                    line: 8,
                    branch: 72,
                    function: 91,
                    statement: 25
                  },
                  name: "infra documentation"
                }
              ]
            }
          ];

          // act
          verify(mockKV.read("infra_5-pr.json"))
            .once();
          verify(mockKV.write("infra_5-pr.json", anything()))
            .once();
          expect(stateTracker.prWrite).to.not.be.null;
          await stateTracker.prWrite?.should.be.congruent(expected);
        });

        it("should return prev and new history", async function() {
          const expected = [
            {
              sha: "6136bd84a4052d2d109fcbee25b60f09b2116150",
              url: "https://github.com/foodpanda/infra",
              action: "https://github.com/foodpanda/infra/actions/runs/4288149762",
              items: [
                {
                  url: "https://infra.site/docs/100",
                  data: {
                    type: "test-coverage",
                    line: 8,
                    branch: 72,
                    function: 91,
                    statement: 25
                  },
                  name: "infra documentation"
                }
              ]
            }
          ];
          // act
          const a = await act.unwrap();
          expect(a.preImage).to.not.be.null;
          expect(a.afterImage).to.not.be.null;
          await a.preImage?.should.be.congruent([]);
          await a.afterImage?.should.be.congruent(expected);
        });

        it("should return current commit entry", async function() {
          const expected =
            {
              sha: "6136bd84a4052d2d109fcbee25b60f09b2116150",
              url: "https://github.com/foodpanda/infra",
              action: "https://github.com/foodpanda/infra/actions/runs/4288149762",
              items: [
                {
                  url: "https://infra.site/docs/100",
                  data: {
                    type: "test-coverage",
                    line: 8,
                    branch: 72,
                    function: 91,
                    statement: 25
                  },
                  name: "infra documentation"
                }
              ]
            };


          // act
          const a = await act.unwrap();
          expect(a.current).to.not.be.null;
          await a.current?.should.be.congruent(expected);
        });

        it("should return base commit entry", async function() {
          // act
          const a = await act.unwrap();
          expect(a.base).to.be.undefined;
        });

      });

      describe("failure cases", function() {
        const inputs: Inputs = {
          sha: "284a50a1d092ff9e40b314e37fdf8c901d197f7d",
          data: [
            {
              url: "https://docker_slim.linux/docs",
              data: {
                type: "documentation"
              },
              name: "docker_slim documentation"
            }
          ],
          pr: Some({
            number: 214,
            baseSha: "21927359a653623008690a0c20722b45ad0eb18d"
          }),
          actionUrl: "https://github.com/nus_ie8827/actions/runs/92",
          repoUrl: "https://github.com/nus_ie8827",
          prefix: "nus_ie8827*"
        };
        const base: HistoryEntry = {
          sha: "21927359a653623008690a0c20722b45ad0eb18d",
          url: "https://sample.com",
          action: "https://sampple.dev",
          items: [
            {
              url: "https://codalytics.code/run/772/adsds/abc",
              data: {
                type: "code-quality",
                qualityRating: "Bad"
              },
              name: "Codalytics"
            }
          ]
        };

        it("should fail if writing to commit history fails", async function() {
          // Mocks
          let mockKV: KeyValueRepository = mock<KeyValueRepository>();

          // write single commit
          when(mockKV.write<HistoryEntry>("nus_ie8827*284a50a1d092ff9e40b314e37fdf8c901d197f7d-commit.json", anything()))
            .thenReturn(Some(new Error("commit write emulated broken")));
          // read base PR
          when(mockKV.read<HistoryEntry>("nus_ie8827*21927359a653623008690a0c20722b45ad0eb18d-commit.json"))
            .thenReturn(Ok(Some(base)));

          // write PR
          when(mockKV.write<HistoryEntry[]>("nus_ie8827*214-pr.json", anything()))
            .thenReturn(None());
          // read PR
          when(mockKV.read<HistoryEntry[]>("nus_ie8827*214-pr.json"))
            .thenReturn(Ok(Some([])));

          let kv = instance(mockKV);
          const hs = new HistoryService(kv);

          // Arrange
          const act = hs.store(inputs);

          // assert
          await act.should.have.errErrorMessage("commit write emulated broken");
        });

        it("should fail if read to PR history fails", async function() {
          // Mocks
          let mockKV: KeyValueRepository = mock<KeyValueRepository>();

          // write single commit
          when(mockKV.write<HistoryEntry>("nus_ie8827*284a50a1d092ff9e40b314e37fdf8c901d197f7d-commit.json", anything()))
            .thenReturn(None());
          // read base PR
          when(mockKV.read<HistoryEntry>("nus_ie8827*21927359a653623008690a0c20722b45ad0eb18d-commit.json"))
            .thenReturn(Ok(Some(base)));

          // write PR
          when(mockKV.write<HistoryEntry[]>("nus_ie8827*214-pr.json", anything()))
            .thenReturn(None());
          // read PR
          when(mockKV.read<HistoryEntry[]>("nus_ie8827*214-pr.json"))
            .thenReturn(Err(new Error("emulate read pr fail")));

          let kv = instance(mockKV);
          const hs = new HistoryService(kv);

          // Arrange
          const act = hs.store(inputs);

          // assert
          await act.should.have.errErrorMessage("emulate read pr fail");
        });

        it("should fail if writing to PR history fails", async function() {
          // Mocks
          let mockKV: KeyValueRepository = mock<KeyValueRepository>();

          // write single commit
          when(mockKV.write<HistoryEntry>("nus_ie8827*284a50a1d092ff9e40b314e37fdf8c901d197f7d-commit.json", anything()))
            .thenReturn(None());
          // read base PR
          when(mockKV.read<HistoryEntry>("nus_ie8827*21927359a653623008690a0c20722b45ad0eb18d-commit.json"))
            .thenReturn(Ok(Some(base)));

          // write PR
          when(mockKV.write<HistoryEntry[]>("nus_ie8827*214-pr.json", anything()))
            .thenReturn(Some(new Error("emulate write pr history fail")));
          // read PR
          when(mockKV.read<HistoryEntry[]>("nus_ie8827*214-pr.json"))
            .thenReturn(Ok(Some([])));

          let kv = instance(mockKV);
          const hs = new HistoryService(kv);

          // Arrange
          const act = hs.store(inputs);

          // assert
          await act.should.have.errErrorMessage("emulate write pr history fail");
        });

        it("should fail if obtaining base SHA fails", async function() {
          // Mocks
          let mockKV: KeyValueRepository = mock<KeyValueRepository>();

          // write single commit
          when(mockKV.write<HistoryEntry>("nus_ie8827*284a50a1d092ff9e40b314e37fdf8c901d197f7d-commit.json", anything()))
            .thenReturn(Some(new Error("emulate base PR fail")));
          // read base PR
          when(mockKV.read<HistoryEntry>("nus_ie8827*21927359a653623008690a0c20722b45ad0eb18d-commit.json"))
            .thenReturn(Ok(Some(base)));

          // write PR
          when(mockKV.write<HistoryEntry[]>("nus_ie8827*214-pr.json", anything()))
            .thenReturn(None());
          // read PR
          when(mockKV.read<HistoryEntry[]>("nus_ie8827*214-pr.json"))
            .thenReturn(Ok(Some([])));

          let kv = instance(mockKV);
          const hs = new HistoryService(kv);

          // Arrange
          const act = hs.store(inputs);

          // assert
          await act.should.have.errErrorMessage("emulate base PR fail");
        });

      });


    });

    describe("Push", function() {

      describe("no error", async function() {
        // Mocks
        let mockKV: KeyValueRepository = mock<KeyValueRepository>();
        let stateTracker: Partial<{
          commitWrite: HistoryEntry,
          prWrite: HistoryEntry[],
        }> = {};


        // write single commit
        when(mockKV.write<HistoryEntry>("nixDarwin?97b305f3bded588346ccbba968204ff65ff7929a-commit.json", anything()))
          .thenCall((_, b: HistoryEntry) => {
            stateTracker.commitWrite = b;
            return None();
          });

        let kv = instance(mockKV);
        const hs = new HistoryService(kv);

        // Arrange
        const inputs: Inputs = {
          sha: "97b305f3bded588346ccbba968204ff65ff7929a",
          data: [
            {
              url: "https://nix.dev/results/501",
              data: {
                type: "test-result",
                fail: 0,
                skip: 0,
                pass: 124
              },
              name: "nix unit tests"
            }
          ],
          pr: None(),
          actionUrl: "https://github.com/nix/actions/runs/52",
          repoUrl: "https://github.com/nix",
          prefix: "nixDarwin?"
        };
        const act = hs.store(inputs);
        // force eval
        await act.native();

        it("should succeed", async function() {
          await act.should.be.ok;
        });

        it("should write to commit history", async function() {
          const expected: HistoryEntry = {
            sha: "97b305f3bded588346ccbba968204ff65ff7929a",
            url: "https://github.com/nix",
            items: [
              {
                url: "https://nix.dev/results/501",
                data: {
                  type: "test-result",
                  fail: 0,
                  skip: 0,
                  pass: 124
                },
                name: "nix unit tests"
              }
            ],
            action: "https://github.com/nix/actions/runs/52"
          };
          verify(mockKV.write("nixDarwin?97b305f3bded588346ccbba968204ff65ff7929a-commit.json", anything())).once();

          expect(stateTracker.commitWrite).to.not.be.null;
          await stateTracker.commitWrite?.should.be.congruent(expected);
        });

        it("should not write to PR history", async function() {
          verify(mockKV.write(anyString(), anything())).once();
          expect(stateTracker.prWrite).to.be.undefined;
        });

        it("should return the current commit", async function() {
          const expected: HistoryEntry = {
            sha: "97b305f3bded588346ccbba968204ff65ff7929a",
            url: "https://github.com/nix",
            items: [
              {
                url: "https://nix.dev/results/501",
                data: {
                  type: "test-result",
                  fail: 0,
                  skip: 0,
                  pass: 124
                },
                name: "nix unit tests"
              }
            ],
            action: "https://github.com/nix/actions/runs/52"
          };
          const a = await act.unwrap();
          await a.current.should.be.congruent(expected);
        });

        it("should not return base, pre image or after image", async function() {
          const a = await act.unwrap();
          expect(a.base).to.be.undefined;
          expect(a.preImage).to.be.undefined;
          expect(a.afterImage).to.be.undefined;
        });
      });

      describe("error cases", async function() {

        // Mocks
        let mockKV: KeyValueRepository = mock<KeyValueRepository>();

        // write single commit
        when(mockKV.write<HistoryEntry>("docker_slim?d35ed1b92a2c5c7d83ef98305832d67841dd4a03-commit.json", anything()))
          .thenReturn(Some(new Error("write emulated broken")));

        let kv = instance(mockKV);
        const hs = new HistoryService(kv);

        // Arrange
        const inputs: Inputs = {
          sha: "d35ed1b92a2c5c7d83ef98305832d67841dd4a03",
          data: [
            {
              url: "https://docker_slim.linux/docs",
              data: {
                type: "documentation"
              },
              name: "docker_slim documentation"
            }
          ],
          pr: None(),
          actionUrl: "https://github.com/docker_slim/actions/runs/1252",
          repoUrl: "https://github.com/docker_slim",
          prefix: "docker_slim?"
        };
        const act = hs.store(inputs);
        // force eval
        await act.native();

        it("should fail if write commit fails", async function() {
          await act.should.have.errErrorMessage("write emulated broken");
        });

      });


    });

  });


});
