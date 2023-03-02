import { InputRetriever, Inputs } from "../interface/input-retriever.js";
import { ActionIO } from "../interface/io.js";
import { ContextRetriever } from "../interface/context-retriever.js";
import { stringToOption } from "../util.js";
import { Validator } from "../interface/validator.js";
import { InputArray } from "../inputs.js";
import { Result } from "../core/result.js";
import { None, Option, Some } from "../core/option.js";

class IoInputRetriever implements InputRetriever {
  io: ActionIO;
  context: ContextRetriever;
  inputValidator: Validator<InputArray>;

  constructor(
    io: ActionIO,
    context: ContextRetriever,
    inputValidator: Validator<InputArray>
  ) {
    this.io = io;
    this.context = context;
    this.inputValidator = inputValidator;
  }

  retrieve(): Result<Inputs, Error> {
    const r = this.io.getObject<InputArray>("data", Some(this.inputValidator));
    return r.map(async (data: InputArray) => {
      const prefix: string = await stringToOption(
        this.io.get("prefix")
      ).unwrapOr("");

      const sha: string = await stringToOption(this.io.get("sha")).unwrapOr(
        this.context.sha
      );

      const repoUrl: string = await stringToOption(this.io.get("url")).unwrapOr(
        this.context.repoUrl
      );

      const pr: Option<{ number: number; baseSha: string }> = (() => {
        switch (this.context.event.__kind) {
          case "push":
          case "other":
            return None();
          case "pullRequest":
            return Some({
              number: this.context.event.value.number,
              baseSha: this.context.event.value.baseRefSha,
            });
          default:
            throw new Error("unreachable");
        }
      })();

      const actionUrl: string = this.context.actionUrl;
      return {
        data,
        sha,
        prefix,
        repoUrl,
        actionUrl,
        pr,
      };
    });
  }
}

export { IoInputRetriever };
