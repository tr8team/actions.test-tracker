import { should } from "chai";
import { object, string } from "superstruct";
import { parseJSON, toResult } from "../../src/lib/util";
import {  Ok } from "ts-results";

should();

const testDummy = object({
  name: string()
});

describe("toResult", function() {
  it("should convert an error case to ErrorStruct Error Result", function() {
    const subject = testDummy.validate({ name: 5 });
    const act = toResult(subject);

    // assert
    act.err.should.be.true;
  });

  it("should convert an success case to Ok Result", function() {
    const subject = testDummy.validate({ name: "hello!" });
    const act = toResult(subject);

    // assert
    act.val.should.deep.equal({ name: "hello!" });
  });
});


describe("parseJSON", function() {

  it("should convert a valid JSON into Ok Result with JSON", function() {

    const subject = `{"name":"ernest","age": 25, "info": { "url":"https://google.com", "male": true }}`;
    const expected = Ok({ name: "ernest", age: 25, info: { url: "https://google.com", male: true } });

    const act = parseJSON(subject);
    act.should.deep.equal(expected);

  });

  it("should convert an invalid JSON to an Error Result with error", function() {

    const subject = `<html>Not JSON</html>`;
    const expected = "Unexpected token < in JSON at position 0";

    const act = parseJSON(subject);
    const error = act.val! as Error;
    error.message.should.deep.equal(expected);

  });

});
