import { chai, describe, expect, it, should } from "vitest";
// @ts-ignore
import helper from "../helper.js";
import { Output } from "../../src/lib/outputs.js";
import { ActionIO } from "../../src/lib/interface/io.js";
import { anyString, anything, instance, mock, verify, when } from "ts-mockito";
import { InputRetriever } from "../../src/lib/interface/input-retriever.js";
import { IHistoryService } from "../../src/lib/service.js";
import { App } from "../../src/lib/main.js";
import { Err, Ok, Result } from "../../src/lib/core/result.js";
import { None } from "../../src/lib/core/option.js";

should();


chai.use(helper);

describe("App", function() {

  describe("start", function() {

    describe("retrieve failure", async function() {
      // Mock Dependencies
      const ioMock: ActionIO = mock<ActionIO>();
      const inputMock: InputRetriever = mock<InputRetriever>();
      const serviceMock: IHistoryService = mock<IHistoryService>();

      when(inputMock.retrieve())
        .thenReturn(Err(new Error("retrieve failure")));

      const io = instance(ioMock);
      const input = instance(inputMock);
      const service = instance(serviceMock);

      const app = new App(io, input, service);

      // act
      const act = app.start();

      // force eval
      await act.native();

      // assert
      it("should return error", async function() {
        await act.should.be.some;
        const err = await act.unwrap();
        err.message.should.be.eq("retrieve failure");

      });
      it("should not execute service store", function() {
        verify(serviceMock.store(anything()))
          .never();
      });
      it("should not execute setObject", function() {
        verify(ioMock.setObject(anyString(), anything()))
          .never();
      });
    });

    describe("store failure", async function() {
      // Mock Dependencies
      const ioMock: ActionIO = mock<ActionIO>();
      const inputMock: InputRetriever = mock<InputRetriever>();
      const serviceMock: IHistoryService = mock<IHistoryService>();

      when(inputMock.retrieve())
        .thenReturn(Ok({
          prefix: "prefix",
          repoUrl: "http://random-url",
          data: [],
          sha: "random-sha",
          pr: None(),
          actionUrl: "http://action"
        }));

      when(serviceMock.store(anything()))
        .thenReturn(Err(new Error("storage failure :<")));

      const io = instance(ioMock);
      const input = instance(inputMock);
      const service = instance(serviceMock);

      const app = new App(io, input, service);

      // act
      const act = app.start();

      // force eval
      await act.native();

      // assert
      it("should return error", async function() {
        await act.should.be.some;
        const a = await act.unwrap();
        a.message.should.equal("storage failure :<");
      });
      it("should not execute setObject", function() {
        verify(ioMock.setObject(anyString(), anything()))
          .never();
      });
    });

    describe("retrieve success", async function() {

      // Mock Dependencies
      const ioMock: ActionIO = mock<ActionIO>();
      const inputMock: InputRetriever = mock<InputRetriever>();
      const serviceMock: IHistoryService = mock<IHistoryService>();

      const spyState: Partial<{ storeInput: string }> = {};

      when(inputMock.retrieve())
        .thenReturn(Ok({
          prefix: "prefix",
          repoUrl: "http://random-url",
          data: [],
          sha: "random-sha",
          pr: None(),
          actionUrl: "http://action"
        }));

      when(serviceMock.store(anything()))
        .thenCall((input): Result<Output, Error> => {
          spyState.storeInput = input;
          return Ok({
            current: {
              url: "http://random-url",
              items: [],
              sha: "random-sha",
              action: "http://action"
            }
          });
        });

      when(ioMock.setObject(anyString(), anything()))
        .thenReturn();

      const io = instance(ioMock);
      const input = instance(inputMock);
      const service = instance(serviceMock);

      const app = new App(io, input, service);

      // act
      const act = app.start();
      await act.native(); // force eval

      // assert
      it("should pass input to service.store", async function() {
        const expected = {
          prefix: "prefix",
          repoUrl: "http://random-url",
          data: [],
          sha: "random-sha",
          pr: None(),
          actionUrl: "http://action"
        };

        verify(serviceMock.store(anything())).once();
        expect(spyState.storeInput).to.not.be.undefined;
        expect(spyState.storeInput).to.not.be.null;
        await spyState.storeInput?.should.be.congruent(expected);
      });
    });

    describe("set Objects that are defined", function() {

      const theory: { subject: Output, expected: Output & { count: number } }[] = [
        // current, base, after, pre
        {
          subject: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            base: {
              action: "https://action/1",
              url: "https://repo/1",
              sha: "1",
              items: []
            },
            afterImage: [
              {
                action: "https://action/100",
                url: "https://repo/100",
                sha: "sha100",
                items: []
              },
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ],
            preImage: [
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ]
          },
          expected: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            base: {
              action: "https://action/1",
              url: "https://repo/1",
              sha: "1",
              items: []
            },
            afterImage: [
              {
                action: "https://action/100",
                url: "https://repo/100",
                sha: "sha100",
                items: []
              },
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ],
            preImage: [
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ],
            count: 4
          }
        },
        // current
        {
          subject: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            }
          },
          expected: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            count: 1
          }
        },
        // current, base
        {
          subject: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            base: {
              action: "https://action/1",
              url: "https://repo/1",
              sha: "1",
              items: []
            }
          },
          expected: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            base: {
              action: "https://action/1",
              url: "https://repo/1",
              sha: "1",
              items: []
            },
            count: 2
          }
        },

        // current, after
        {
          subject: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            afterImage: [
              {
                action: "https://action/100",
                url: "https://repo/100",
                sha: "sha100",
                items: []
              },
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ]
          },
          expected: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            afterImage: [
              {
                action: "https://action/100",
                url: "https://repo/100",
                sha: "sha100",
                items: []
              },
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ],
            count: 2
          }
        },

        // current,  pre
        {
          subject: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            preImage: [
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ]
          },
          expected: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            preImage: [
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ],
            count: 2
          }
        },

        // current, base, after
        {
          subject: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            base: {
              action: "https://action/1",
              url: "https://repo/1",
              sha: "1",
              items: []
            },
            afterImage: [
              {
                action: "https://action/100",
                url: "https://repo/100",
                sha: "sha100",
                items: []
              },
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ]
          },
          expected: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            base: {
              action: "https://action/1",
              url: "https://repo/1",
              sha: "1",
              items: []
            },
            afterImage: [
              {
                action: "https://action/100",
                url: "https://repo/100",
                sha: "sha100",
                items: []
              },
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ],
            count: 3
          }
        },
        // current, base, pre
        {
          subject: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            base: {
              action: "https://action/1",
              url: "https://repo/1",
              sha: "1",
              items: []
            },
            preImage: [
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ]
          },
          expected: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            base: {
              action: "https://action/1",
              url: "https://repo/1",
              sha: "1",
              items: []
            },
            preImage: [
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ],
            count: 3
          }
        },
        // current, after, pre
        {
          subject: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            afterImage: [
              {
                action: "https://action/100",
                url: "https://repo/100",
                sha: "sha100",
                items: []
              },
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ],
            preImage: [
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ]
          },
          expected: {
            current: {
              action: "https://action/100",
              url: "https://repo/100",
              sha: "sha100",
              items: []
            },
            afterImage: [
              {
                action: "https://action/100",
                url: "https://repo/100",
                sha: "sha100",
                items: []
              },
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ],
            preImage: [
              {
                action: "https://action/99",
                url: "https://repo/99",
                sha: "sha99",
                items: []
              }
            ],
            count: 3
          }
        }
      ];

      theory.forEach(function({ subject, expected }) {
        it("should only write defined objects to output", async function() {
          // Mock Dependencies
          const ioMock: ActionIO = mock<ActionIO>();
          const inputMock: InputRetriever = mock<InputRetriever>();
          const serviceMock: IHistoryService = mock<IHistoryService>();

          const spyState: Partial<Output> = {};

          when(inputMock.retrieve())
            .thenReturn(Ok({
              prefix: "prefix",
              repoUrl: "http://random-url",
              data: [],
              sha: "random-sha",
              pr: None(),
              actionUrl: "http://action"
            }));

          when(serviceMock.store(anything()))
            .thenReturn(Ok(subject));

          when(ioMock.setObject(anyString(), anything()))
            .thenCall((key, value) => {
              if (key === "current") spyState.current = value;
              if (key === "before") spyState.preImage = value;
              if (key === "after") spyState.afterImage = value;
              if (key === "base") spyState.base = value;
            });

          const io = instance(ioMock);
          const input = instance(inputMock);
          const service = instance(serviceMock);

          const app = new App(io, input, service);

          // act
          const act = app.start();

          // assert
          await act.should.be.none;
          await expect(spyState.base).to.be.congruent(expected.base);
          await expect(spyState.current).to.be.congruent(expected.current);
          await expect(spyState.afterImage).to.be.congruent(expected.afterImage);
          await expect(spyState.preImage).to.be.congruent(expected.preImage);
          verify(ioMock.setObject(anyString(),anything())).times(expected.count);
        });

      });
    });


  });

});
