import { should, it, describe } from "vitest";
import { UnwrapError } from "../../../src/lib/core/error";

should();

describe("UnwrapError", function() {
  it("should contain the type of error with the message and the monad type", function() {
    const err = new UnwrapError("An error occurred", "result","Expected Ok got Error");
    err.should.have.property("type", "Expected Ok got Error");
    err.should.have.property("message", "An error occurred");
    err.should.have.property("monadType", "result");
    err.should.have.property("name", "UnwrapError");
  });

  it("should contain the type of error with the message and the monad type", function() {
    const err = new UnwrapError("An error occurred", "result","Expected Err got Ok");
    err.should.have.property("type", "Expected Err got Ok");
    err.should.have.property("message", "An error occurred");
    err.should.have.property("monadType", "result");
    err.should.have.property("name", "UnwrapError");
  });

  it("should contain the type of error with the message and the monad type", function() {
    const err = new UnwrapError("An error occurred", "option","Expected Some got None");
    err.should.have.property("type", "Expected Some got None");
    err.should.have.property("message", "An error occurred");
    err.should.have.property("monadType", "option");
    err.should.have.property("name", "UnwrapError");
  });
});
