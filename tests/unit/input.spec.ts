import { should } from "chai";
import { Input, input } from "../../src/lib/inputs";

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
            qualityRating: "high",
          },
        },
        expected: {
          name: "Test Input",
          url: "https://test.com",
          data: {
            type: "code-quality",
            qualityRating: "high",
          },
        },
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
            function: 25,
          },
        },
        expected: {
          name: "Coverage Input",
          url: "https://test.com/coverage",
          data: {
            type: "test-coverage",
            statement: 80,
            line: 50,
            branch: 27,
            function: 25,
          },
        },
      },
    ];

    theory.forEach(({ subject, expected }) => {
      it("should return the validated object and no error object", () => {
        // act
        const [error, value] = input.validate(subject);
        should().not.exist(error);
        value!.should.deep.equal(expected);
      });
    });
  });

  describe("invalid objects", () => {
    describe("missing required fields", () => {
      const theory = [
        {
          subject: { name: "Test Input" },
          expected: "At path: url -- Expected a string, but received: undefined",
        },
        {
          subject: { name: "Test Input", url: "https://test.com" },
          expected:
            "At path: data -- Expected the value to satisfy a union of `object | object | object | object`, but received: undefined",
        },
      ];
      theory.forEach(({ subject, expected }) => {
        it(`for subject ${JSON.stringify(subject)} error should be ${expected}`, () => {
          const [error, value] = input.validate(subject);
          error!.message.should.equal(expected);
          should().not.exist(value);
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
            data: { type: "code-quality", qualityRating: "high" },
          },
          expected:
            'At path: extraField -- Expected a value of type `never`, but received: `"some value"`',
        },
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: {
              type: "code-quality",
              qualityRating: "high",
              extraField: "some value",
            },
          },
          expected:
            "At path: data -- Expected the value to satisfy a union of `object | object | object | object`, but received: [object Object]",
        },
      ];
      theory.forEach(({ subject, expected }) => {
        it(`for subject ${JSON.stringify(subject)} error should be ${expected}`, () => {
          const [error, value] = input.validate(subject);
          error!.message.should.equal(expected);
          should().not.exist(value);
        });
      });
    });

    describe("fields with wrong type", () => {
      const theory = [
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "code-quality", qualityRating: 123 },
          },
          expected:
            "At path: data -- Expected the value to satisfy a union of `object | object | object | object`, but received: [object Object]",
        },
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "test-coverage", line: "50" },
          },
          expected:
            "At path: data -- Expected the value to satisfy a union of `object | object | object | object`, but received: [object Object]",
        },
      ];
      theory.forEach(({ subject, expected }) => {
        it(`for subject ${JSON.stringify(subject)} error should be ${expected}`, () => {
          const [error, value] = input.validate(subject);
          error!.message.should.equal(expected);
          should().not.exist(value);
        });
      });
    });

    describe("fields with invalid values", () => {
      const theory = [
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "invalid-type", qualityRating: "high" },
          },
          expected:
            "At path: data -- Expected the value to satisfy a union of `object | object | object | object`, but received: [object Object]",
        },
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "test-coverage", line: 5, function: 10, branch: 20, statement: "72" },
          },
          expected:
            "At path: data -- Expected the value to satisfy a union of `object | object | object | object`, but received: [object Object]",
        },
      ];
      theory.forEach(({ subject, expected }) => {
        it(`for subject ${JSON.stringify(subject)} error should be ${expected}`, () => {
          const [error, value] = input.validate(subject);
          error!.message.should.equal(expected);
          should().not.exist(value);
        });
      });
    });

    describe("empty object", () => {
      it("should return error if object is empty", () => {
        const [error, value] = input.validate({});
        error!.message.should.include(
          "At path: name -- Expected a string, but received: undefined",
        );
        should().not.exist(value);
      });
    });

    describe("mismatch metadata and type", () => {
      const theory = [
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "test-coverage", pass: 5, fail: 0, skip: 0 },
          },
          expected:
            "At path: data -- Expected the value to satisfy a union of `object | object | object | object`, but received: [object Object]",
        },
        {
          subject: {
            name: "Test Input",
            url: "https://test.com",
            data: { type: "test-result", qualityRating: "5" },
          },
          expected:
            "At path: data -- Expected the value to satisfy a union of `object | object | object | object`, but received: [object Object]",
        },
      ];
      theory.forEach(({ subject, expected }) => {
        it(`for subject ${JSON.stringify(subject)} error should be ${expected}`, () => {
          const [error, value] = input.validate(subject);
          error!.message.should.equal(expected);
          should().not.exist(value);
        });
      });
    });
  });
});
