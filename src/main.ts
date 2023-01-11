import { debug, getInput, setFailed, setOutput } from "@actions/core";
import { Struct, StructError } from "superstruct";
import { Result } from "ts-results";
import { parseJSON, toResult } from "./lib/util";
import { inputArray } from "./lib/inputs";

function jsonInput<T>(
  validator: Struct<T>,
  s: string
): Result<T, StructError | Error> {
  const raw = getInput(s);
  debug(`raw: ${raw}`);
  return parseJSON(raw).andThen((j) => toResult(validator.validate(j)));
}

const dataArray = jsonInput(inputArray, "data");
const gistId = getInput("gist_id");
const token = getInput("github_token");
const prNumber = getInput("pr_number");

try {
  dataArray
    .map((history) => {
      debug(`data: ${JSON.stringify(history)}`);

      debug(`gistId: ${gistId}`);
      debug(`token: ${token}`);
      debug(`pr_number: ${prNumber}`);
      // debug(`github content: ${JSON.stringify(github.context)}`);
    })
    .unwrap();
} catch (error) {
  if (error instanceof Error) setFailed(error.message);
}

setOutput("time", new Date().toTimeString());
