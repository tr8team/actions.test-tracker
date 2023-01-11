import * as process from "process";
import * as path from "path";
import * as cp from "child_process";
import * as os from "os";

type Command = {
  meta: { [k: string]: string };
  content: string;
};

type ActionOutput = { [k: string]: Command[] };

type ActionInput = {
  relativePath: string[];
  input?: { [k: string]: string };
};

export function emulateAction({
  relativePath,
  input,
}: ActionInput): ActionOutput {
  if(input != null) {
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        process.env[`INPUT_${key.replace(/ /g, "_").toUpperCase()}`] = input[key];
      }
    }
  }
  const ip = path.join(__dirname, "..", "..", ...relativePath);
  const options: cp.ExecFileSyncOptions = {
    env: process.env,
  };
  const spawn = cp.spawnSync("ts-node", [ip], options);
  const stdout = spawn.stdout
    .toString()
    .split(os.EOL)
    .filter((x) => x.length !== 0);
  const stderr = spawn.stderr
    .toString()
    .split(os.EOL)
    .filter((x) => x.length !== 0);
  return [...stdout, ...stderr]
    .map((str) => {

      if(!str.startsWith("::")) {
        return { command: "info", meta: {}, content: str };
      }
      const [, metaString, content] = /::(.*?)::(.*)/.exec(str) as unknown as [
        string,
        string,
        string
      ];
      const meta = (metaString as string)
        .split(" ")
        .filter((pair) => pair.includes("="))
        .reduce((acc: { [k: string]: string }, pair) => {
          const [key, value] = pair.split("=");
          acc[key] = value;
          return acc;
        }, {});
      const command = metaString.split(" ")[0];
      return { command, meta, content };
    })
    .reduce((acc: ActionOutput, { command, meta, content }) => {
      if (!acc[command]) {
        acc[command] = [];
      }
      acc[command].push({ meta, content });
      return acc;
    }, {});
}

export const actionScripts = ["tests", "integration", "action_scripts"];
