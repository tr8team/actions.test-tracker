import { ActionIO } from "./interface/io";
import { ILogger } from "./interface/logger";
import { InputArray } from "./inputs";
import { Validator } from "./interface/validator";
import { Ok, Result } from "@hqoss/monads";

class App {
  io: ActionIO;
  log: ILogger;
  inputArrayValidator: Validator<InputArray>;

  constructor(
    io: ActionIO,
    log: ILogger,
    inputArrayValidator: Validator<InputArray>
  ) {
    this.io = io;
    this.log = log;
    this.inputArrayValidator = inputArrayValidator;
  }

  start(): Result<string, Error> {
    return Ok("complete");
  }
}

export { App };
