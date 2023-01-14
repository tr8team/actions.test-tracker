import { should } from "chai";
import { object, string } from "zod";
import { catchToResult, parseJSON, toResult } from "../../src/lib/util";
import { Ok } from "@hqoss/monads";

should();

const testDummy = object({
  name: string()
});

describe("toResult", function() {
  it("should convert an error case to Error Result", function() {
    const subject = testDummy.safeParse({ name: 5 });
    const act = toResult(subject);

    // assert
    act.isErr().should.be.true;

  });

  it("should convert an success case to Ok Result", function() {
    const subject = testDummy.safeParse({ name: "hello!" });
    const act = toResult(subject);

    // assert
    act.unwrap().should.deep.equal({ name: "hello!" });
  });
});

describe("parseJSON", function() {

  it("should convert a valid JSON into Ok Result with JSON", function() {

    const subject = `{"name":"ernest","age": 25, "info": { "url":"https://google.com", "male": true }}`;
    const expected = Ok({ name: "ernest", age: 25, info: { url: "https://google.com", male: true } });

    const act = parseJSON<any>(subject);
    act.isOk().should.be.true;
    act.unwrap().should.deep.equal(expected.unwrap());

  });

  it("should convert an invalid JSON to an Error Result with error", function() {

    const subject = `<html>Not JSON</html>`;
    const expected = "Unexpected token < in JSON at position 0";

    const act = parseJSON(subject);
    act.isErr().should.be.true;
    act.unwrapErr().message.should.deep.equal(expected);

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
      colors: ["green","blue","orange"],
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
