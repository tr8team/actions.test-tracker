import { InputArray } from "../inputs.js";
import { Result } from "../core/result.js";
import { Option } from "../core/option.js";

type PR = {
  number: number;
  baseSha: string;
};

interface Inputs {
  data: InputArray;
  prefix: string;
  sha: string;
  repoUrl: string;
  actionUrl: string;
  pr: Option<PR>;
}

interface InputRetriever {
  retrieve(): Result<Inputs, Error>;
}

export type { InputRetriever, Inputs, PR };
