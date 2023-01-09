[![CI/CD](https://github.com/tr8team/typescript-github-action-template/actions/workflows/cicd.yml/badge.svg)](https://github.com/tr8team/typescript-github-action-template/actions/workflows/cicd.yml)

# Create a JavaScript Action using TypeScript

Use this template to bootstrap the creation of a TypeScript action.:rocket:

This template includes:

- [Nix](https://nixos.org/)
- [direnv](https://direnv.net/)
- [Taskfile](https://taskfile.dev/)
- Test
  - Framework: [Mocha](https://mochajs.org/)
  - Assertion: [Chai](https://www.chaijs.com/)
  - Coverage: [NYC](https://istanbul.js.org/)
- Dependabot
- [Semantic Releaser](https://semantic-release.gitbook.io/semantic-release/usage/configuration) with [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/)
- Linters
  - [ES Lint](https://eslint.org/)
  - [shellcheck](https://www.shellcheck.net/)
  - [gitlint](https://jorisroovers.com/gitlint/)
- Formatters
  - [shfmt](https://github.com/mvdan/sh)
  - [prettier](https://prettier.io/)
  - [nixpkgs-fmt](https://github.com/nix-community/nixpkgs-fmt)
- [Pre-commit](https://pre-commit.com/)

## Create an action from this template

Click the `Use this Template` and provide the new repo details for your action

## Pre-requisite

All dependencies are pre-install via `nix` and activated via `direnv`

- [Nix](https://nixos.org/) > 2.12.0
- [direnv](https://direnv.net/) > 2.23.2
- [Docker](https://hub.docker.com/)

## Get Started

Setup the repository

```
pls setup
```

Running tests

```
pls test
```

Check test coverage

```
pls test:cover
```

## Quality Assurance

Running all checks

```
pls check
```

Run Formatters

```
pls fmt
```

Run Linters

```
pls lint
```

Run Enforcers

```
pls enforce
```

## Working with CI

This template comes with in-built tools to debug CI.
CI Checks include:

- Build
- Pre Commit
- Test

### Dropping into an emulated environment

To enter an isolated CI-like environment to play around or test, run:

```
pls ci:isolate
```

If you require to enter the `nix-shell` under the `ci` attribute, you can run:

```
pls ci:isolate:nix-shell
```

### Build

This ensures that the commit can be built by compiling TypeScript to JavaScript and using ncc to merge into a single distributable file.

To run this CI:

```
pls ci:build
```

To run it in fully emulated CI environment:

```
pls ci:emulate:build
```

To stay in the fully emulated CI envionrment after the action is completed:

```
pls ci:emulate:build:debug
```

### Pre-Commit

This ensures that the commit passes all pre-commit checks, such as linting and formatting

To run this CI:

```
pls ci:precommit
```

To run it in fully emulated CI environment:

```
pls ci:emulate:precommit
```

To stay in the fully emulated CI envionrment after the action is completed:

```
pls ci:emulate:precommit:debug
```

### Test

This ensure all test pass and ensures test coverage is above a certain threshold. It also generates reports necessary for publishing

To run this CI:

```
pls ci:test
```

To run it in fully emulated CI environment:

```
pls ci:emulate:test
```

To stay in the fully emulated CI envionrment after the action is completed:

```
pls ci:emulate:test:debug
```

## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
import * as core from '@actions/core';
...

async function run() {
  try {
      ...
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Publishing an action

This repository has configured Semantic Releaser with conventional commits. By simply merging to the `main` branch, the action will automatically released.
