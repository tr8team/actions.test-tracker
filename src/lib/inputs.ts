import {
  array,
  object,
  literal,
  number,
  string,
  discriminatedUnion,
  z,
} from "zod";

const testCoverageMetadata = object({
  type: literal("test-coverage"),
  line: number().min(0).max(100),
  statement: number().min(0).max(100),
  function: number().min(0).max(100),
  branch: number().min(0).max(100),
}).strict();

const testResultMetadata = object({
  type: literal("test-result"),
  pass: number().min(0),
  fail: number().min(0),
  skip: number().min(0),
}).strict();

const documentationMetadata = object({
  type: literal("documentation"),
}).strict();

const codeQualityMetadata = object({
  type: literal("code-quality"),
  qualityRating: string(),
}).strict();

const metadata = discriminatedUnion("type", [
  codeQualityMetadata,
  documentationMetadata,
  testCoverageMetadata,
  testResultMetadata,
]);

const input = object({
  name: string(),
  url: string().url(),
  data: metadata,
}).strict();

const inputArray = array(input);

const historyEntry = object({
  sha: string(),
  url: string(),
  action: string(),
  items: inputArray,
}).strict();

const history = array(historyEntry);

type Input = z.infer<typeof input>;
type InputArray = z.infer<typeof inputArray>;
type HistoryEntry = z.infer<typeof historyEntry>;
type History = z.infer<typeof history>;

export { metadata, input, inputArray, historyEntry, history };

export type { Input, InputArray, HistoryEntry, History };
