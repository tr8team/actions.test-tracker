import { should } from "chai";

// @ts-ignore
import { actionScripts, emulateAction } from "./helper";
// @ts-ignore
import { loadSecret } from "./secret-loader";

import { GistKeyValue } from "../../src/external/gist-key-value";
import { Octokit } from "@octokit/rest";
import { KeyValueRepository } from "../../src/lib/interface/repo";

should();

const { gistKeyValue: secrets } = loadSecret().unwrap();

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

describe("GistKeyValue", function() {
  this.timeout(5000);
  // Setup
  before(async function() {
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
        },
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
  const kvAuth: KeyValueRepository<Person> = new GistKeyValue(ok, secrets.gistId);
  const kvNoAuth: KeyValueRepository<Person> = new GistKeyValue(new Octokit(), secrets.gistId);
  const kvWrongAuth: KeyValueRepository<Person> = new GistKeyValue(new Octokit({
    auth: "wrong"
  }), secrets.gistId);
  const kvNoGist: KeyValueRepository<Person> = new GistKeyValue(ok, "");

  describe("read", function() {
    it("should return content if it exist", async function() {
      const r = await kvAuth.read("get-test-succeed");
      r.isOk().should.be.true;
      r.unwrap().isSome().should.be.true;
      r.unwrap().unwrap().should.deep.equal({
        name: "ernest",
        age: 17
      });
    });
    it("should return None if the key does not exist", async function() {
      const r = await kvAuth.read("get-test-none");
      r.isOk().should.be.true;
      r.unwrap().isSome().should.be.false;
    });
    it("should fail if JSON cannot be parsed", async function() {
      const r = await kvAuth.read("get-test-fail-json");
      r.isOk().should.be.false;
      const e = r.unwrapErr();
      e.message.should.include("Unexpected token < in JSON");
    });
    it("should fail if the gist does not exist", async function() {
      const r = await kvNoGist.read("get-test-succeed");
      r.isOk().should.be.false;
      const e = r.unwrapErr() as any;
      e.status.should.equal(404);
      e.response.data.message.should.equal("Not Found");
      e.name.should.equal("HttpError");
      e.message.should.equal("Not Found");

    });
    it("should succeed even without auth", async function() {
      const r = await kvNoAuth.read("get-test-succeed");
      r.isOk().should.be.true;
    });
  });

  describe("write", function() {
    it("should create content if not exist", async function() {

      // ensure that it doesn't exist first
      const e = await kvAuth.read("set-test-no-exist");
      e.isOk().should.be.true;
      e.unwrap().isNone().should.be.true;
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
      const readResult = await kvAuth.read("set-test-no-exist");

      writeResult.isNone().should.be.true;
      readResult.isOk().should.be.true;
      readResult.unwrap().isSome().should.be.true;
      readResult.unwrap().unwrap().should.deep.equal(ex);


    });
    it("should update content if it exist", async function() {
      // arrange
      const subj = {
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
      e.isOk().should.be.true;
      e.unwrap().isSome().should.be.true;
      e.unwrap().isSome().should.not.deep.equal(ex);

      // act
      const writeResult = await kvAuth.write("set-test-exist", subj);
      const readResult = await kvAuth.read("set-test-exist");

      writeResult.isNone().should.be.true;

      readResult.isOk().should.be.true;
      readResult.unwrap().isSome().should.be.true;
      readResult.unwrap().unwrap().should.deep.equal(ex);

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
      const r = await kvNoGist.write("set-test-exist", subj);
      r.isSome().should.be.true;
      const e = r.unwrap() as any;
      e.status.should.equal(404);
      e.response.data.message.should.equal("Not Found");
      e.name.should.equal("HttpError");
      e.message.should.equal("Not Found");

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
      const r = await kvWrongAuth.write("set-test-exist", subj);
      r.isSome().should.be.true;
      const e = r.unwrap() as any;
      e.status.should.equal(401);
      e.response.data.message.should.equal("Bad credentials");
      e.name.should.equal("HttpError");
      e.message.should.equal("Bad credentials");
    });
  });

  describe("delete", function() {
    it("should return Error if the does not file exists", async function() {

      // ensure that it doesn't exist first
      const e = await kvAuth.read("del-test-no-exist");
      e.isOk().should.be.true;
      e.unwrap().isNone().should.be.true;

      const delResult = await kvAuth.delete("del-test-no-exist");
      delResult.isSome().should.be.true;

      const err = delResult.unwrap() as any;
      err.status.should.equal(422);
      err.name.should.equal("HttpError");
      err.message.should.include("Validation Failed");


    });
    it("should return None if the file deleted successfully", async function() {
      // ensure that file exists
      const e = await kvAuth.read("del-test-success");
      e.isOk().should.be.true;
      e.unwrap().isSome().should.be.true;

      // Delete
      const delResult = await kvAuth.delete("del-test-success");
      delResult.isNone().should.be.true;

      // Ensure that file doesn't exist anymore
      const reCheck = await kvAuth.read("del-test-success");
      reCheck.isOk().should.be.true;
      reCheck.unwrap().isNone().should.be.true;


    });
    it("should return Error if the gist does not exist", async function() {

      const r = await kvNoGist.delete("del-test-no-gist");
      r.isSome().should.be.true;
      const err = r.unwrap() as any;
      err.status.should.equal(404);
      err.name.should.equal("HttpError");
      err.message.should.include("Not Found");

    });
    it("should return Error without auth", async function() {

      const r = await kvWrongAuth.delete("del-test-no-auth");
      r.isSome().should.be.true;
      const err = r.unwrap() as any;
      err.status.should.equal(401);
      err.name.should.equal("HttpError");
      err.message.should.include("Bad credentials");

    });
  });
});
