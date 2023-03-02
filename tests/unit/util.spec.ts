import { chai, should, it, describe } from "vitest";
import { object, string } from "zod";
import { catchToResult, parseJSON, stringToOption, toResult } from "../../src/lib/util.js";
import { Ok } from "../../src/lib/core/result.js";
// @ts-ignore
import helper from "../helper.js";

should();

chai.use(helper);

const testDummy = object({
  name: string()
});

describe("toResult", function() {
  it("should convert an error case to Error Result", async function() {
    const subject = testDummy.safeParse({ name: 5 });
    const act = toResult(subject);

    // assert
    await act.should.be.err;
  });

  it("should convert an success case to Ok Result", async function() {
    const subject = testDummy.safeParse({ name: "hello!" });
    const act = toResult(subject);

    // assert
    return act.should.be.okOf({ name: "hello!" });
  });
});

describe("parseJSON", function() {

  it("should convert a valid JSON into Ok Result with JSON", async function() {

    const subject = `{"name":"ernest","age": 25, "info": { "url":"https://google.com", "male": true }}`;
    const expected = Ok({ name: "ernest", age: 25, info: { url: "https://google.com", male: true } });

    const act = parseJSON<any>(subject);
    return act.should.be.congruent(expected);
  });

  it("should convert an invalid JSON to an Error Result with error", async function() {

    const subject = `<html>Not JSON</html>`;
    const expected = "Unexpected token < in JSON at position 0";

    const act = parseJSON(subject);
    return act.should.be.errErrorMessage(expected);
  });

});

describe("catchToResult", function() {

  it("should return error directly", function() {
    const subj = new Error("This is an test error");
    const ex = new Error("This is an test error");

    const act = catchToResult(subj);
    act.should.deep.equal(ex);
  });

  it("should return string wrapped as Error Result", function() {
    const subj = "This is an test error string to be thrown";
    const ex = new Error("This is an test error string to be thrown");

    const act = catchToResult(subj);
    act.should.deep.equal(ex);
  });

  it("should return stringified JSON wrapped as Error Result", function() {
    const subj = {
      name: "Calvin",
      age: 250,
      colors: ["green", "blue", "orange"],
      food: {
        type: "indian",
        name: "prata"
      }
    };
    const ex = new Error(`{"name":"Calvin","age":250,"colors":["green","blue","orange"],"food":{"type":"indian","name":"prata"}}`);

    const act = catchToResult(subj);
    act.should.deep.equal(ex);
  });


});


describe("stringToOption", function() {
  it("should return None for null inputs", async function() {
    const subject = null;
    const act = stringToOption(subject);

    return act.should.be.none;
  });
  it("should return None for undefined inputs", function() {
    const subject = undefined;
    const act = stringToOption(subject);
    return act.should.be.none;
  });
  it("should return None for no inputs", function() {
    const subj = {} as any;
    const act = stringToOption(subj.some);
    return act.should.be.none;
  });
  it("should return None for empty strings", function() {
    const subj = "";
    const act = stringToOption(subj);
    return act.should.be.none;
  });
  it("should return Some with the string value", function() {
    const subj = "sample";
    const act = stringToOption(subj);
    return act.should.be.someOf("sample");
  });
});
