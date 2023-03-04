# Test-Tracker

Tracks and store historic information about CIs such as:

- Test Result
- Documentation
- Test Coverage
- Code Quality

Uses Gist to persist data.

# Get Started

This job depends on other jobs to source and extract data before it is persisted:

```yaml
name: Example Workflow
on: push
jobs:
  Test:
    runs-on: ubuntu-latest
    steps:
      # insert Test step here
      - name: Test Tracker
        id: test-tracker
        uses: tr8team/test-tracker@v1.0.0
        with:
          data: "[]" # insert the data you need to track here
          gist_id: "" # id of Gist to persist data
          github_token: "" # GitHub Token with Gist read-write permission
          prefix: "" # prefix to append to all keys of the tracking mechanism
```

<!-- prettier-ignore-start -->
<!-- action-docs-inputs -->
## Inputs

| parameter | description | required | default |
| --- | --- | --- | --- |
| data | Test Data to Persist. Should be Array of [Input](#input-schema) | `true` | [] |
| gist_id | Gist ID to use as persistent store | `true` |  |
| github_token | GitHub action token with Gist Permission | `true` |  |
| prefix | Prefix for Key Storage | `false` |  |
| sha | Use this SHA instead of commit SHA | `false` |  |
| url | Use this as the repository URL instead of auto-detection | `false` |  |
<!-- action-docs-inputs -->

<!-- action-docs-outputs -->
## Outputs

| parameter | description |
| --- | --- |
| current | The current commit's history entry. Type of [HistoryEntry](#history-entry-schema) |
| before | The whole history of this PR, excluding this commit. Null if not a PR. Type of [HistoryEntry](#history-entry-schema) |
| after | The whole history of this PR, including this commit. Null if not a PR. Type of [HistoryEntry](#history-entry-schema) |
| base | The history entry of the a base commit of the PR. Null if not PR or if base commit has nothing stored. Type of [HistoryEntry](#history-entry-schema) |
<!-- action-docs-outputs -->

<!-- action-docs-runs -->
## Runs

This action is a `node16` action.
<!-- action-docs-runs -->
<!-- prettier-ignore-end -->

## Input Schema

Test tracker can store an array of data related a specific commit or for a PR.

Below is an example of a single input:

```yaml
name: Unit Test Results
url: https://test-results/sha
data:
  type: "test-result"
  pass: 210
  skip: 3
  fail: 1
```

| Key    | Description                                                                                                                                                                            |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | Uniquely identify the type of data to see across commits                                                                                                                               |
| `url`  | Url to the webpage to see the extra details of this data                                                                                                                               |
| `data` | Metadata attached for post-processing, summaries or quality gates. Currently supports Documentation, Code Quality, Test Result and Test coverage. Each data is different for each type |

#### Documentation

Since there are no metadata related to documents, this is simply:

```yaml
name: Docs
url: https://link.to.docs.for/this-commit
data:
  type: "documentation"
```

#### Test Results

Stores the metadata for the test results:

```yaml
name: Unit Test Result
url: https://link.to.test_results/for/this-commit
data:
  type: "test-result"
  pass: 200
  skip: 3
  fail: 0
```

| Field  | Description                | Type     |
| ------ | -------------------------- | -------- |
| `pass` | How many tests passed      | `number` |
| `skip` | How many tests was skipped | `number` |
| `fail` | How many test failed       | `number` |

#### Test Coverage

Stores the metadata for the test coverages:

```yaml
name: Test Coverage
url: https://link.to.test_coverage/for/this-commit
data:
  type: "test-coverage"
  line: 100
  statement: 99.2
  branch: 85
  function: 92.5
```

| Field       | Description        | Type     |
| ----------- | ------------------ | -------- |
| `line`      | Line Coverage      | `number` |
| `statement` | Statement Coverage | `number` |
| `branch`    | Branch Coverage    | `number` |
| `function`  | Function Coverage  | `number` |

#### Code Quality

Stores the metadata for code quality:

```yaml
name: Code Quality
url: https://link.to.code_quality/for/this-commit
data:
  type: "code-quality"
  qualityRating: "A-"
```

| Field           | Description                        | Type     |
| --------------- | ---------------------------------- | -------- |
| `qualityRating` | Quality Rating in any custom scale | `string` |

## History Entry Schema

History Entry are how data are stored, per commit. Examples:

```yaml
sha: bab55d3830fe69833c9fecaa51fe2c829a7508f3
url: https://github.com/curl/curl/tree/bab55d3830fe69833c9fecaa51fe2c829a7508f3
action: https://github.com/curl/curl/actions/runs/4329236607/jobs/412431623
items:
  - name: Test Coverage
    url: https://link.to.code.quality/for-this-comit
    data:
      type: "code-quality"
      qualityRating: "A-"
  - name: Unit Tests
    url: https://unit-test/results
    data:
      type: "test-result"
      pass: 200
      skip: 3
      fail: 0
```

| Field    | Description                                      | Type                       |
| -------- | ------------------------------------------------ | -------------------------- |
| `sha`    | SHA of the commit                                | `string`                   |
| `url`    | URL to repository commit that produced this data | `string`                   |
| `action` | Action URL that produced this data               | `string`                   |
| `items`  | List of items to store with this commit          | [`Input[]`](#input-schema) |

# Contributing

To contribute, please look at [Contributing](./Contributing.md)

# Author

- [Ernest (ESD)](mailto:ernest@tr8.io)
