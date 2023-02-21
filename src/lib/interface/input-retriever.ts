import { InputArray } from "../inputs";
import { Result } from "../core/result";
import { Option } from "../core/option";

interface Inputs {
  data: InputArray;
  prefix: string;
  sha: string;
  repoUrl: string;
  actionUrl: string;
  prNumber: Option<number>;
}

interface InputRetriever {
  retrieve(): Result<Inputs, Error>;
}

export { InputRetriever, Inputs };
