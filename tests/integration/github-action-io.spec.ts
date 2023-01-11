import { should } from "chai";
// @ts-ignore
import { actionScripts, emulateAction } from "./helper";

should();

describe("GithubActionIo for ActionIO", function() {

  describe("get", function() {
    it("should retrieve action input values", function() {
      // arrange
      const input = {
        name: "Ernest",
        age: "17"
      };
      const expected = {
        "debug": [
          {
            "content": "Hello Ernest!",
            "meta": {}
          },
          {
            "content": "You are 17 years old!",
            "meta": {}
          }
        ]
      }
      // act
      const output = emulateAction({
        relativePath: [...actionScripts, "get_write_debug.ts"],
        input,
      });

      // assert
      output.should.deep.equal(expected);
    });
    it("should return empty string if no input is placed", function() {
      it("should retrieve action input values", function() {
        // arrange
        const input = {
        };
        const expected = {
          "debug": [
            {
              "content": "Hello !",
              "meta": {}
            },
            {
              "content": "You are  years old!",
              "meta": {}
            }
          ]
        }
        // act
        const output = emulateAction({
          relativePath: [...actionScripts, "get_write_debug.ts"],
          input,
        });

        // assert
        output.should.deep.equal(expected);
      });
    });
  });

  describe("getObject", function() {
    describe("with validator", function() {
      it("should return error if its not a valid JSON", function() {
        // arrange
        const input = {
          person: `<html>Not JSON</html>`
        };
        const expected = {
          "error": [
            {
              "content": "Unexpected token < in JSON at position 0",
              "meta": {},
            }
          ]
        }
        // act
        const output = emulateAction({
          relativePath: [...actionScripts, "get_object_write_debug.ts"],
          input,
        });

        // assert
        output.should.deep.equal(expected);
      });
      it("should return error if the validator fails", function() {
        // arrange
        const input = {
          person: `{"name":"Ernest", "age": 19, "phone":88881234,"vaccinated":true, "address":{ "block":200, "door":"17-328", "street":"jane street" }}`
        };
        const expected = {
          "error": [
            {
              "content": "At path: phone -- Expected a string, but received: 88881234",
              "meta": {},
            }
          ]
        }
        // act
        const output = emulateAction({
          relativePath: [...actionScripts, "get_object_write_debug.ts"],
          input,
        });

        // assert
        output.should.deep.equal(expected);
      });
      it("should return object if its a valid object", function() {
        // arrange
        const input = {
          person: `{"name":"Ernest", "age": 19, "phone":"88881234","vaccinated":true, "address":{ "block":200, "door":"17-328", "street":"jane street" }}`
        };
        const expected = {
          "debug": [
            {
              "content": "Hello Ernest!",
              "meta": {},
            },
            {
              "content": "You are 19 years old!",
              "meta": {},
            },
            {
              "content": "You have taken the vaccine!",
              "meta": {},
            },
            {
              "content": "Your phone number is 88881234!",
              "meta": {},
            },
            {
              "content": "Your address is {\"block\":200,\"door\":\"17-328\",\"street\":\"jane street\"}!",
              "meta": {},
            },
          ]
        }
        // act
        const output = emulateAction({
          relativePath: [...actionScripts, "get_object_write_debug.ts"],
          input,
        });

        // assert
        output.should.deep.equal(expected);
      });
    });
    describe("without validator", function() {
      it("should return error if its not a valid JSON", function() {
        // arrange
        const input = {
          person: `<html>Not JSON</html>`
        };
        const expected = {
          "error": [
            {
              "content": "Unexpected token < in JSON at position 0",
              "meta": {},
            }
          ]
        }
        // act
        const output = emulateAction({
          relativePath: [...actionScripts, "get_object_write_debug_without_validator.ts"],
          input,
        });

        // assert
        output.should.deep.equal(expected);
      });
      it("should return object if its a valid object", function() {
        // arrange
        const input = {
          person: `{ "key1" : "val1" , "key2" : { "key3" : "val3" } }`
        };
        const expected = {
          debug: [
            {
              content: `{"key1":"val1","key2":{"key3":"val3"}}`,
              meta: {},
            }
          ]
        }
        // act
        const output = emulateAction({
          relativePath: [...actionScripts, "get_object_write_debug_without_validator.ts"],
          input,
        });

        // assert
        output.should.deep.equal(expected);
      });
    });
  });

  describe("set", function() {
    it("should set output", function() {
      const expected = {
          "set-output": [
            {
              content: "random value 2",
              meta: {
                name: "first-key",
              }
            }
          ]
        }
      ;
      const output = emulateAction({
        relativePath: [...actionScripts, "set_string_output.ts"],
        input: {},
      });
      output.should.deep.equal(expected);
    });
    it("should not set output if empty value was set", function() {
      const expected = {
          "set-output": [
            {
              content: "",
              meta: {
                name: "first-key",
              }
            }
          ]
        }
      ;
      const output = emulateAction({
        relativePath: [...actionScripts, "set_empty_string_output.ts"],
        input: {},
      });
      output.should.deep.equal(expected);
    });
  });

  describe("setObject", function() {
    it("should set output", function() {
      const expected = {
          "set-output": [
            {
              content: `{"name":"Ernest","age":17}`,
              meta: {
                name: "first-key",
              }
            }
          ]
        }
      ;
      const output = emulateAction({
        relativePath: [...actionScripts, "set_object_output.ts"],
        input: {},
      });
      output.should.deep.equal(expected);
    });
  });


});
