import { GithubActionIO } from "../../../../src/external/github-action-i-o";
import { debug, setFailed } from "@actions/core";
import { boolean, Infer, number, object, string } from "superstruct";

const action = new GithubActionIO();

const person = object({
  name: string(),
  age: number(),
  phone: string(),
  vaccinated: boolean(),
  address: object({
    block: number(),
    door: string(),
    street: string(),
  }),
});

type Person = Infer<typeof person>;

const p = action.getObject("person", person);

if (p.ok) {
  const per: Person = p.unwrap();
  debug(`Hello ${per.name}!`);
  debug(`You are ${per.age} years old!`);
  debug(`You ${per.vaccinated ? "have" : "have not"} taken the vaccine!`);
  debug(`Your phone number is ${per.phone}!`);
  debug(`Your address is ${JSON.stringify(per.address)}!`);
} else {
  const err = p.val as Error;
  setFailed(err.message);
}
