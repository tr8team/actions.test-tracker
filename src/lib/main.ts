import { InputRetriever } from "./interface/input-retriever.js";
import { ActionIO } from "./interface/io.js";
import { IHistoryService } from "./service.js";
import { Option } from "./core/option.js";

class App {
  constructor(io: ActionIO, input: InputRetriever, service: IHistoryService) {
    this.#io = io;
    this.#input = input;
    this.#service = service;
  }
  #io: ActionIO;
  #input: InputRetriever;
  #service: IHistoryService;

  start(): Option<Error> {
    return this.#input
      .retrieve()
      .andThen((inputs) => this.#service.store(inputs))
      .exec((r) => {
        this.#io.setObject("current", r.current);
        if (r.preImage) this.#io.setObject("before", r.preImage);
        if (r.afterImage) this.#io.setObject("after", r.afterImage);
        if (r.base) this.#io.setObject("base", r.base);
      })
      .err();
  }
}

export { App };
