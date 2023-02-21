import { InputRetriever, Inputs } from "../interface/input-retriever";
import { ActionIO } from "../interface/io";
import { ContextRetriever } from "../interface/context-retriever";
import { stringToOption } from "../util";
import { Validator } from "../interface/validator";
import { InputArray } from "../inputs";
import { Result } from "../core/result";
import { None, Some } from "../core/option";

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
    return r.map(async (data) => {
      const prefix: string = await stringToOption(
        this.io.get("prefix")
      ).unwrapOr("");

      const sha: string = await stringToOption(this.io.get("sha")).unwrapOr(
        this.context.sha
      );

      const repoUrl: string = await stringToOption(this.io.get("url")).unwrapOr(
        this.context.repoUrl
      );

      const prNumber = (() => {
        switch (this.context.event.__kind) {
          case "push":
          case "other":
            return None<number>();
          case "pullRequest":
            return Some<number>(this.context.event.value.number);
        }
      })();

      const actionUrl: string = this.context.actionUrl;
      return {
        data,
        sha,
        prefix,
        repoUrl,
        actionUrl,
        prNumber,
      };
    });
  }
}

export { IoInputRetriever };
