import { GithubActionIO } from "../../../../src/external/github-action-i-o";
import { debug, setFailed } from "@actions/core";
import { boolean, z, number, object, string } from "zod";
import { ZodValidatorAdapter } from "../../../../src/lib/adapters/zod-validator-adapter";
import { Validator } from "../../../../src/lib/interface/validator";
import { Some } from "../../../../src/lib/core/option";


async function main() {
  const action = new GithubActionIO();

  const person = object({
    name: string(),
    age: number(),
    phone: string(),
    vaccinated: boolean(),
    address: object({
      block: number(),
      door: string(),
      street: string()
    })
  });

  type Person = z.infer<typeof person>;

  const v: Validator<Person> = new ZodValidatorAdapter(person);


  const p = action.getObject("person", Some(v));
  const ok = await p.isOk();
  if (ok) {
    const per: Person = await p.unwrap();
    debug(`Hello ${per.name}!`);
    debug(`You are ${per.age} years old!`);
    debug(`You ${per.vaccinated ? "have" : "have not"} taken the vaccine!`);
    debug(`Your phone number is ${per.phone}!`);
    debug(`Your address is ${JSON.stringify(per.address)}!`);
  } else {
    const err = await p.unwrapErr();
    setFailed(err.message);
  }

}

main().then();
