import { should } from "chai";
import { object, string } from "superstruct";
import { toResult } from "../../src/lib/util";

should();

const testDummy = object({
  name: string(),
});

describe("toResult", function () {
  it("should convert an error case to ErrorStruct Error Result", function () {
    const subject = testDummy.validate({ name: 5 });
    const act = toResult(subject);

    // assert
    act.err.should.be.true;
  });

  it("should convert an success case to Ok Result", function () {
    const subject = testDummy.validate({ name: "hello!" });
    const act = toResult(subject);

    // assert
    act.val.should.deep.equal({ name: "hello!" });
  });
});
