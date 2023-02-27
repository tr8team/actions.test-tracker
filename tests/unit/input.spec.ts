import { should, it, describe } from "vitest";
import { Input, input } from "../../src/lib/inputs.js";
import { SafeParseError, SafeParseSuccess } from "zod";

should();

describe("input validator", () => {
  describe("valid objects", () => {
    const theory: { subject: any; expected: Input }[] = [
      {
        subject: {
          name: "Test Input",
          url: "https://test.com",
          data: {
            type: "code-quality",
            qualityRating: "high"
          }
        },
        expected: {
          name: "Test Input",
          url: "https://test.com",
          data: {
            type: "code-quality",
            qualityRating: "high"
          }
        }
      },
      {
        subject: {
          name: "Coverage Input",
          url: "https://test.com/coverage",
          data: {
            type: "test-coverage",
            statement: 80,
            line: 50,
            branch: 27,
            function: 25
          }
        },
        expected: {
          name: "Coverage Input",
          url: "https://test.com/coverage",
          data: {
            type: "test-coverage",
            statement: 80,
            line: 50,
            branch: 27,
            function: 25
          }
        }
      }
    ];

    theory.forEach(({ subject, expected }) => {
      it("should return the validated object and no error object", () => {
        // act
        const act = input.safeParse(subject) as SafeParseSuccess<Input>;

        act.success.should.be.true;
        act.data.should.deep.equal(expected);

      });
    });
  });

  describe("invalid objects", () => {
    describe("missing required fields", () => {
      const theory = [
        {
          subject: { name: "Test Input" },
          expected: {
            issues: [{
              code: "invalid_type",
              expected: "string",
              received: "undefined",
              path: ["url"],
              message: "Required"
            }, {
              code: "invalid_type",
              expected: "object",
              received: "undefined",
              path: ["data"],
              message: "Required"
            }], name: "ZodError"
          }
        },
        {
          subject: { name: "Test Input", url: "https://test.com" },
          expected: {
            issues: [
              {
                code: "invalid_type",
                expected: "object",
                received: "undefined",
                path: ["data"],
                message: "Required"
              }
            ], name: "ZodError"
          }
        }
      ];
      theory.forEach(({ subject, expected }) => {
        it(`for subject ${JSON.stringify(subject)} error should be ${JSON.stringify(expected)}`, () => {
          const act = input.safeParse(subject) as SafeParseError<Input>;
          act.success.should.be.false;
          act.error.issues.should.deep.equal(expected.issues);
        });
      });
    });

    describe("extra fields", () => {
      const theory = [
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            extraField: "some value",
            data: { type: "code-quality", qualityRating: "high" }
          },
          expected: {
            "issues": [{
              "code": "unrecognized_keys",
              "keys": ["extraField"],
              "path": [],
              "message": "Unrecognized key(s) in object: 'extraField'"
            }], "name": "ZodError"
          }
        },
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: {
              type: "code-quality",
              qualityRating: "high",
              extraField: "some value"
            }
          },
          expected: {
            "issues": [{
              "code": "unrecognized_keys",
              "keys": ["extraField"],
              "path": ["data"],
              "message": "Unrecognized key(s) in object: 'extraField'"
            }], "name": "ZodError"
          }
        }
      ];
      theory.forEach(({ subject, expected }) => {
        it(`for subject ${JSON.stringify(subject)} error should be ${expected}`, () => {
          const act = input.safeParse(subject) as SafeParseError<Input>;
          act.success.should.be.false;
          act.error.issues.should.deep.equal(expected.issues);
        });
      });
    });

    describe("fields with wrong type", () => {
      const theory = [
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "code-quality", qualityRating: 123 }
          },

          expected: {
            issues: [{
              code: "invalid_type",
              expected: "string",
              message: "Expected string, received number",
              path: [
                "data",
                "qualityRating"
              ],
              received: "number"
            }],
            name: "ZodError"
          }
        },
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "test-coverage", line: "50" }
          },
          expected: {
            issues: [
              {
                code: "invalid_type",
                expected: "number",
                message: "Expected number, received string",
                path: ["data", "line"],
                received: "string"
              },
              {
                code: "invalid_type",
                expected: "number",
                message: "Required",
                path: ["data", "statement"],
                received: "undefined"
              },
              {
                code: "invalid_type",
                expected: "number",
                message: "Required",
                path: ["data", "function"],
                received: "undefined"
              },
              {
                code: "invalid_type",
                expected: "number",
                message: "Required",
                path: ["data", "branch"],
                received: "undefined"
              }
            ], "name": "ZodError"
          }
        }
      ];
      theory.forEach(({ subject, expected }) => {
        it(`for subject ${JSON.stringify(subject)} error should be ${expected}`, () => {
          const act = input.safeParse(subject) as SafeParseError<Input>;
          act.success.should.be.false;
          act.error.issues.should.deep.equal(expected.issues);
        });
      });
    });

    describe("fields with invalid values", () => {
      const theory = [
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "invalid-type", qualityRating: "high" }
          },
          expected: {
            issues: [
              {
                code: "invalid_union_discriminator",
                message: "Invalid discriminator value. Expected 'code-quality' | 'documentation' | 'test-coverage' | 'test-result'",
                options: ["code-quality", "documentation", "test-coverage", "test-result"],
                path: ["data", "type"]
              }
            ],
            "name": "ZodError"
          }
        },
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "test-coverage", line: 5, function: 10, branch: 20, statement: "72" }
          },
          expected: {
            issues: [
              {
                code: "invalid_type",
                expected: "number",
                message: "Expected number, received string",
                path: ["data", "statement"],
                received: "string"
              }
            ], "name": "ZodError"
          }
        }
      ];
      theory.forEach(({ subject, expected }) => {
        it(`for subject ${JSON.stringify(subject)} error should be ${expected}`, () => {
          const act = input.safeParse(subject) as SafeParseError<Input>;
          act.success.should.be.false;
          act.error.issues.should.deep.equal(expected.issues);
        });
      });
    });

    describe("empty object", () => {
      it("should return error if object is empty", () => {
        const ex = [
          {
            code: "invalid_type",
            expected: "string",
            received: "undefined",
            path: ["name"],
            message: "Required"
          },
          {
            code: "invalid_type",
            expected: "string",
            received: "undefined",
            path: ["url"],
            message: "Required"
          },
          {
            code: "invalid_type",
            expected: "object",
            received: "undefined",
            path: ["data"],
            message: "Required"
          }
        ];
        const act = input.safeParse({}) as SafeParseError<Input>;
        act.success.should.be.false;
        act.error.issues.should.deep.equal(ex);
      });
    });

    describe("mismatch metadata and type", () => {
      const theory = [
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "test-coverage", pass: 5, fail: 0, skip: 0 }
          },
          expected:
            {
              issues: [
                {
                  code: "invalid_type",
                  expected: "number",
                  received: "undefined",
                  path: [
                    "data",
                    "line"
                  ],
                  message: "Required"
                },
                {
                  code: "invalid_type",
                  expected: "number",
                  received: "undefined",
                  path: [
                    "data",
                    "statement"
                  ],
                  message: "Required"
                },
                {
                  code: "invalid_type",
                  expected: "number",
                  received: "undefined",
                  path: [
                    "data",
                    "function"
                  ],
                  message: "Required"
                },
                {
                  code: "invalid_type",
                  expected: "number",
                  received: "undefined",
                  path: [
                    "data",
                    "branch"
                  ],
                  message: "Required"
                },
                {
                  code: "unrecognized_keys",
                  keys: [
                    "pass",
                    "fail",
                    "skip"
                  ],
                  path: [
                    "data"
                  ],
                  message: "Unrecognized key(s) in object: 'pass', 'fail', 'skip'"
                }
              ],
              name: "ZodError"
            }
        },
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "test-result", qualityRating: "5" }
          },
          expected:
            {
              issues: [
                {
                  code: "invalid_type",
                  expected: "number",
                  received: "undefined",
                  path: [
                    "data",
                    "pass"
                  ],
                  message: "Required"
                },
                {
                  code: "invalid_type",
                  expected: "number",
                  received: "undefined",
                  path: [
                    "data",
                    "fail"
                  ],
                  message: "Required"
                },
                {
                  code: "invalid_type",
                  expected: "number",
                  received: "undefined",
                  path: [
                    "data",
                    "skip"
                  ],
                  message: "Required"
                },
                {
                  code: "unrecognized_keys",
                  keys: [
                    "qualityRating"
                  ],
                  path: [
                    "data"
                  ],
                  message: "Unrecognized key(s) in object: 'qualityRating'"
                }
              ],
              name: "ZodError"
            }
        }
      ];
      theory.forEach(({ subject, expected }) => {
        it(`for subject ${JSON.stringify(subject)} error should be ${expected}`, () => {
          const act = input.safeParse(subject) as SafeParseError<Input>;
          act.success.should.be.false;
          act.error.issues.should.deep.equal(expected.issues);
        });
      });
    });
  });
});
