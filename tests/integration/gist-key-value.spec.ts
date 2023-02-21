import { beforeAll, chai, describe, it, should } from "vitest";

// @ts-ignore
import { actionScripts, emulateAction } from "./helper";
// @ts-ignore
import { loadSecret } from "./secret-loader";
// @ts-ignore
import helper from "../helper";

import { GistKeyValue } from "../../src/external/gist-key-value";
import { Octokit } from "@octokit/rest";
import { KeyValueRepository } from "../../src/lib/interface/repo";
import { Ok } from "../../src/lib/core/result";
import { None, Some } from "../../src/lib/core/option";

should();
chai.use(helper);



describe("GistKeyValue", async function() {

  const { gistKeyValue: secrets } = await loadSecret().unwrap();


  type Person = {
    name: string
    age: number
    address: {
      blk: number
      street: string
    }
  };

  const ok = new Octokit({
    auth: secrets.token
  });
  // Setup
  beforeAll(async function() {
    const defaultContent = JSON.stringify({
      name: "tester1",
      age: 201,
      address: {
        blk: 2010,
        street: "walnut str"
      }
    });

    // Create and delete necessary files in a single Gist to setup test scenarios
    const gistDef = { gist_id: secrets.gistId };

    // obtain is needed to check if there are anything that needs to be deleted for the test
    const obtainPromise = await ok.gists.get(gistDef);
    const setupPromise = ok.gists.update({
      ...gistDef,
      description: "Setup Test",
      files: {
        "get-test-succeed.json": {
          content: `{"name":"ernest","age":17}`
        },
        "get-test-fail-json.json": {
          content: `<xml>notjson</xml>`
        },
        "set-test-exist.json": {
          content: defaultContent
        },
        "del-test-success.json": {
          content: `{"data":"exist"}`
        },
        "del-test-no-auth.json": {
          content: `{"data":"exist"}`
        },
        "del-test-no-gist.json": {
          content: `{"data":"exist"}`
        }
      }
    });

    const [obtain, _] = await Promise.all([obtainPromise, setupPromise]);
    // delete if these fil existfile exist
    const files: any = {};
    let content = false;
    if (obtain.data?.files && obtain.data?.files["set-test-no-exist.json"]) {
      files["set-test-no-exist.json"] = null;
      content = true;
    }
    if (content) {
      await ok.gists.update({
        ...gistDef,
        description: "Setup Test",
        files
      });
    }
  });

  // Test subjects
  const kvAuth: KeyValueRepository = new GistKeyValue(ok, secrets.gistId);
  const kvNoAuth: KeyValueRepository = new GistKeyValue(new Octokit(), secrets.gistId);
  const kvWrongAuth: KeyValueRepository = new GistKeyValue(new Octokit({
    auth: "wrong"
  }), secrets.gistId);
  const kvNoGist: KeyValueRepository = new GistKeyValue(ok, "");

  describe("read", function() {
    it("should return content if it exist", async function() {

      const r = await kvAuth.read("get-test-succeed");
      const ex = Ok(Some({
        name: "ernest",
        age: 17
      }));
      await r.should.be.congruent(ex);

    });

    it("should return None if the key does not exist", async function() {
      const act = await kvAuth.read("get-test-none");
      const ex = Ok(None());
      await act.should.be.congruent(ex);
    });

    it("should fail if JSON cannot be parsed", async function() {
      const act = await kvAuth.read("get-test-fail-json");
      await act.should.have.errErrorMessage("Unexpected token < in JSON at position 0");
    });

    it("should fail if the gist does not exist", async function() {
      const act = await kvNoGist.read("get-test-succeed");
      await act.should.be.err;

      const e = await act.unwrapErr() as any;
      e.status.should.equal(404);
      e.response.data.message.should.equal("Not Found");
      e.name.should.equal("HttpError");
      e.message.should.equal("Not Found");

    });
    it("should succeed even without auth", async function() {
      const act = await kvNoAuth.read("get-test-succeed");
      const ex = { "name": "ernest", "age": 17 };

      await act.should.be.congruent(Ok(Some(ex)));
    });
  });

  describe("write", function() {
    it("should create content if not exist", async function() {

      // ensure that it doesn't exist first
      const e = await kvAuth.read("set-test-no-exist");
      await e.should.be.congruent(Ok(None()));

      // actual test
      const subj: Person = {
        name: "ern",
        age: 120,
        address: {
          street: "china",
          blk: 1000
        }
      };
      const ex: Person = {
        name: "ern",
        age: 120,
        address: {
          street: "china",
          blk: 1000
        }
      };

      const writeResult = await kvAuth.write("set-test-no-exist", subj);
      await writeResult.should.be.none;



      const readResult = await kvAuth.read("set-test-no-exist");
      await readResult.should.be.congruent(Ok(Some(ex)));

    });
    it("should update content if it exist", async function() {
      // arrange
      const subj  = {
        name: "zhang",
        age: 909,
        address: {
          street: "jalan kayu",
          blk: 70302
        }
      };
      const ex = {
        name: "zhang",
        age: 909,
        address: {
          street: "jalan kayu",
          blk: 70302
        }
      };
      // pre-act
      const e = await kvAuth.read("set-test-exist");
      await e.should.not.be.congruent(Ok(Some(ex)));
      // act
      const writeResult = await kvAuth.write("set-test-exist", subj);
      await writeResult.should.be.none;

      const readResult = await kvAuth.read("set-test-exist");
      await readResult.should.be.congruent(Ok(Some(ex)));
    });
    it("should fail if the gist does not exist", async function() {
      const subj = {
        name: "jerry",
        age: 1472,
        address: {
          street: "teh halia",
          blk: 8634
        }
      };
      const act = await kvNoGist.write("set-test-exist", subj);
      await act.should.be.some;
      const a = await act.unwrap() as any;
      a.status.should.equal(404);
      a.response.data.message.should.equal("Not Found");
      a.name.should.equal("HttpError");
      a.message.should.equal("Not Found");

    });
    it("should fail with incorrect auth permission", async function() {
      const subj = {
        name: "bert",
        age: 3337,
        address: {
          street: "jalan limau",
          blk: 2241
        }
      };
      const act = await kvWrongAuth.write("set-test-exist", subj);
      await act.should.be.some;
      const a = await act.unwrap() as any;
      a.status.should.equal(401);
      a.response.data.message.should.equal("Bad credentials");
      a.name.should.equal("HttpError");
      a.message.should.equal("Bad credentials");
    });
  });

  describe("delete", function() {
    it("should return Error if the does not file exists", async function() {

      // ensure that it doesn't exist first
      const e = await kvAuth.read("del-test-no-exist");
      await e.should.be.congruent(Ok(None()));

      const delResult = await kvAuth.delete("del-test-no-exist");
      await delResult.should.be.some;

      const err = await delResult.unwrap() as any;
      err.status.should.equal(422);
      err.name.should.equal("HttpError");
      err.message.should.include("Validation Failed");


    });

    it("should return None if the file deleted successfully", async function() {
      // ensure that file exists
      const e = await kvAuth.read("del-test-success");
      await e.should.be.congruent(Ok(Some({"data":"exist"})));

      // Delete
      const delResult = await kvAuth.delete("del-test-success");
      await delResult.should.be.none;

      // Ensure that file doesn't exist anymore
      const reCheck = await kvAuth.read("del-test-success");
      await reCheck.should.be.congruent(Ok(None()));

    });

    it("should return Error if the gist does not exist", async function() {

      const act = await kvNoGist.delete("del-test-no-gist");
      await act.should.be.some;
      const err = await act.unwrap() as any;
      err.status.should.equal(404);
      err.name.should.equal("HttpError");
      err.message.should.include("Not Found");

    });
    it("should return Error without auth", async function() {

      const act = await kvWrongAuth.delete("del-test-no-auth");
      await act.should.be.some;
      const err = await act.unwrap() as any;
      err.status.should.equal(401);
      err.name.should.equal("HttpError");
      err.message.should.include("Bad credentials");

    });
  });
});
