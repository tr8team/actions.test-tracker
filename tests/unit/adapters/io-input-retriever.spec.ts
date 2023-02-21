import { chai, describe, it, should } from "vitest";

import { IoInputRetriever } from "../../../src/lib/adapters/io-input-retriever";
import { ActionIO } from "../../../src/lib/interface/io";
import { anything, instance, mock, when } from "ts-mockito";
import { Inputs } from "../../../src/lib/interface/input-retriever";
import { ContextRetriever } from "../../../src/lib/interface/context-retriever";
import { ZodValidatorAdapter } from "../../../src/lib/adapters/zod-validator-adapter";
import { InputArray, inputArray } from "../../../src/lib/inputs";
import { None, Some } from "../../../src/lib/core/option";
import { Err, Ok } from "../../../src/lib/core/result";
// @ts-ignore
import helper from "../../helper";

should();

chai.use(helper);

describe("IoInputRetriever", function() {

  describe("retrieve", function() {

    it("should be equal", async function() {
      const ex = Some(3);
      const act = Some(3);
      return act.should.be.congruent(ex);
    });
    it("should return all from input all input is placed", async function() {

      // Mocks
      // input validator
      const inputValidator = new ZodValidatorAdapter(inputArray);
      // Mock IO
      let mockIO: ActionIO = mock<ActionIO>();
      when(mockIO.get("prefix")).thenReturn("simple-sample");
      when(mockIO.get("sha")).thenReturn("da39a3ee5e6b4b0d3255bfef95601890afd80709");
      when(mockIO.get("url")).thenReturn("https://repo.com");
      when(mockIO.getObject<InputArray>("data", anything()))
        .thenReturn(
          Ok<InputArray, Error>([
              {
                name: "Unit Test",
                url: "https://unit-test.com",
                data: { type: "test-result", pass: 2, fail: 3, skip: 20 }
              },
              {
                name: "Integration Test",
                url: "https://int-test.com",
                data: { type: "test-result", pass: 25, fail: 7, skip: 7 }
              },
              {
                name: "Unit Coverage",
                url: "https://unit-test-coverage.com",
                data: { type: "test-coverage", line: 25, statement: 7, function: 7, branch: 7 }
              }
            ]
          ));
      let io = instance(mockIO);
      // Mock Context
      let context: ContextRetriever = {
        actionUrl: "https://action.com",
        event: {
          __kind: "pullRequest",
          value: {
            number: 2,
            pull_request_state: "closed"
          }
        },
        org: "sample-org",
        repo: "sample-repo",
        repoUrl: "https://inner-repo",
        sha: "inner-sha"
      };


      // Arrange
      const retriever = new IoInputRetriever(io, context, inputValidator);
      const ex: Inputs = {
        prefix: "simple-sample",
        sha: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
        repoUrl: "https://repo.com",
        actionUrl: "https://action.com",
        prNumber: Some(2),
        data: [
          {
            name: "Unit Test",
            url: "https://unit-test.com",
            data: { type: "test-result", pass: 2, fail: 3, skip: 20 }
          },
          {
            name: "Integration Test",
            url: "https://int-test.com",
            data: { type: "test-result", pass: 25, fail: 7, skip: 7 }
          },
          {
            name: "Unit Coverage",
            url: "https://unit-test-coverage.com",
            data: { type: "test-coverage", line: 25, statement: 7, function: 7, branch: 7 }
          }
        ]
      };

      // Act
      const act = retriever.retrieve();

      // assert

      return act.should.be.okOf(ex);
    });

    it("should return empty prefix if prefix not inputted", function() {

      // Mocks
      // input validator
      const inputValidator = new ZodValidatorAdapter(inputArray);
      // Mock IO
      let mockIO: ActionIO = mock<ActionIO>();
      when(mockIO.get("sha")).thenReturn("random-sha");
      when(mockIO.get("url")).thenReturn("https://repo.com/1");
      when(mockIO.getObject<InputArray>("data", anything()))
        .thenReturn(
          Ok<InputArray, Error>([
              {
                name: "Unit Test",
                url: "https://unit-test.com/1",
                data: { type: "test-result", pass: 12, fail: 3, skip: 2 }
              },
              {
                name: "Integration Test",
                url: "https://int-test.com/1",
                data: { type: "test-result", pass: 1, fail: 7, skip: 1 }
              },
              {
                name: "Unit Coverage",
                url: "https://unit-test-coverage.com/1",
                data: { type: "test-coverage", line: 28, statement: 7, function: 7, branch: 7 }
              }
            ]
          ));
      let io = instance(mockIO);
      // Mock Context
      let context: ContextRetriever = {
        actionUrl: "https://action.com/1",
        event: {
          __kind: "pullRequest",
          value: {
            number: 2,
            pull_request_state: "closed"
          }
        },
        org: "sample-org-1",
        repo: "sample-repo-1",
        repoUrl: "https://inner-repo/1",
        sha: "inner-sha-1"
      };
      // Arrange
      const retriever = new IoInputRetriever(io, context, inputValidator);
      const ex: Inputs = {
        prefix: "",
        sha: "random-sha",
        repoUrl: "https://repo.com/1",
        actionUrl: "https://action.com/1",
        prNumber: Some(2),
        data: [
          {
            name: "Unit Test",
            url: "https://unit-test.com/1",
            data: { type: "test-result", pass: 12, fail: 3, skip: 2 }
          },
          {
            name: "Integration Test",
            url: "https://int-test.com/1",
            data: { type: "test-result", pass: 1, fail: 7, skip: 1 }
          },
          {
            name: "Unit Coverage",
            url: "https://unit-test-coverage.com/1",
            data: { type: "test-coverage", line: 28, statement: 7, function: 7, branch: 7 }
          }
        ]
      };

      // Act
      const act = retriever.retrieve();

      // assert
      return act.should.be.okOf(ex);
    });

    it("should return default sha if sha not inputted", function() {

      // Mocks
      // input validator
      const inputValidator = new ZodValidatorAdapter(inputArray);
      // Mock IO
      let mockIO: ActionIO = mock<ActionIO>();
      when(mockIO.get("prefix")).thenReturn("sample-prefix-2");
      when(mockIO.get("url")).thenReturn("https://repo.com/2");
      when(mockIO.getObject<InputArray>("data", anything()))
        .thenReturn(
          Ok<InputArray, Error>([
              {
                name: "Unit Test",
                url: "https://unit-test.com/2",
                data: { type: "test-result", pass: 22, fail: 3, skip: 2 }
              },
              {
                name: "Integration Test",
                url: "https://int-test.com/2",
                data: { type: "test-result", pass: 2, fail: 7, skip: 1 }
              },
              {
                name: "Unit Coverage",
                url: "https://unit-test-coverage.com/2",
                data: { type: "test-coverage", line: 28, statement: 7, function: 7, branch: 7 }
              }
            ]
          ));
      let io = instance(mockIO);
      // Mock Context
      let context: ContextRetriever = {
        actionUrl: "https://action.com/2",
        event: {
          __kind: "push",
          value: {
            ref: "refs/tag/random",
            shaAfter: "before-sha",
            shaBefore: "after-sha"
          }
        },
        org: "sample-org-2",
        repo: "sample-repo-2",
        repoUrl: "https://inner-repo/2",
        sha: "inner-sha-2"
      };
      // Arrange
      const retriever = new IoInputRetriever(io, context, inputValidator);
      const ex: Inputs = {
        prefix: "sample-prefix-2",
        sha: "inner-sha-2",
        repoUrl: "https://repo.com/2",
        actionUrl: "https://action.com/2",
        prNumber: None(),
        data: [
          {
            name: "Unit Test",
            url: "https://unit-test.com/2",
            data: { type: "test-result", pass: 22, fail: 3, skip: 2 }
          },
          {
            name: "Integration Test",
            url: "https://int-test.com/2",
            data: { type: "test-result", pass: 2, fail: 7, skip: 1 }
          },
          {
            name: "Unit Coverage",
            url: "https://unit-test-coverage.com/2",
            data: { type: "test-coverage", line: 28, statement: 7, function: 7, branch: 7 }
          }
        ]
      };

      // Act
      const act = retriever.retrieve();

      // assert
      return act.should.be.okOf(ex);
    });

    it("should return default repoUrl if repoUrl not inputted", function() {

      // Mocks
      // input validator
      const inputValidator = new ZodValidatorAdapter(inputArray);
      // Mock IO
      let mockIO: ActionIO = mock<ActionIO>();
      when(mockIO.get("prefix")).thenReturn("sample-prefix-3");
      when(mockIO.get("sha")).thenReturn("outer-sha-3");
      when(mockIO.getObject<InputArray>("data", anything()))
        .thenReturn(
          Ok<InputArray, Error>([
              {
                name: "Unit Test",
                url: "https://unit-test.com/3",
                data: { type: "test-result", pass: 32, fail: 3, skip: 2 }
              },
              {
                name: "Integration Test",
                url: "https://int-test.com/3",
                data: { type: "test-result", pass: 3, fail: 7, skip: 1 }
              },
              {
                name: "Unit Coverage",
                url: "https://unit-test-coverage.com/3",
                data: { type: "test-coverage", line: 38, statement: 7, function: 7, branch: 7 }
              }
            ]
          ));
      let io = instance(mockIO);
      // Mock Context
      let context: ContextRetriever = {
        actionUrl: "https://action.com/3",
        event: {
          __kind: "pullRequest",
          value: {
            number: 33,
            pull_request_state: "closed"
          }
        },
        org: "sample-org-3",
        repo: "sample-repo-3",
        repoUrl: "https://inner-repo/3",
        sha: "inner-sha-3"
      };
      // Arrange
      const retriever = new IoInputRetriever(io, context, inputValidator);
      const ex: Inputs = {
        prefix: "sample-prefix-3",
        sha: "outer-sha-3",
        repoUrl: "https://inner-repo/3",
        actionUrl: "https://action.com/3",
        prNumber: Some(33),
        data: [
          {
            name: "Unit Test",
            url: "https://unit-test.com/3",
            data: { type: "test-result", pass: 32, fail: 3, skip: 2 }
          },
          {
            name: "Integration Test",
            url: "https://int-test.com/3",
            data: { type: "test-result", pass: 3, fail: 7, skip: 1 }
          },
          {
            name: "Unit Coverage",
            url: "https://unit-test-coverage.com/3",
            data: { type: "test-coverage", line: 38, statement: 7, function: 7, branch: 7 }
          }
        ]
      };

      // Act
      const act = retriever.retrieve();

      // assert
      return act.should.be.okOf(ex);
    });

    it("should return error if data is not valid", async function() {

      // Mocks
      // input validator
      const inputValidator = new ZodValidatorAdapter(inputArray);
      // Mock IO
      let mockIO: ActionIO = mock<ActionIO>();
      when(mockIO.getObject<any>("data", anything()))
        .thenReturn(
          Err<any, Error>(new Error("random error")));
      let io = instance(mockIO);
      // Mock Context
      let context: ContextRetriever = {
        actionUrl: "https://action.com/4",
        event: {
          __kind: "pullRequest",
          value: {
            number: 43,
            pull_request_state: "closed"
          }
        },
        org: "sample-org-4",
        repo: "sample-repo-4",
        repoUrl: "https://inner-repo/4",
        sha: "inner-sha-4"
      };
      // Arrange
      const retriever = new IoInputRetriever(io, context, inputValidator);

      // Act
      const act = retriever.retrieve();
      const err = await act.unwrapErr();

      // assert
      err.message.should.deep.equal("random error");
      return act.should.be.err;
    });


  });

});
