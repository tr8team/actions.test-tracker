import { UnwrapError } from "./error.js";
import { KOption } from "./option.js";
// Creates a new instance of `Result` as the `err` variant.
/**
 * @template T,X
 * @param error - error to be converted to a Result
 * @returns {Result<T,X>} - new instance of `Result` as the `err` variant
 */
function Err(error) {
    return new KResult((async () => {
        const err = await error;
        return ["err", err];
    })());
}
// Creates a new instance of `Result` as the `ok` variant.
/**
 * @template T,X
 * @param val - value to be converted to a Result
 * @returns {Result<T,X>} - new instance of `Result` as the `ok` variant
 */
function Ok(val) {
    return new KResult((async () => {
        const v = await val;
        return ["ok", v];
    })());
}
class Res {
    // Resolve the promise of a result, Promise<Result<T, E>> to Result<T,E> without async/await
    /**
     * @template T,E
     * @param p - promise of a result to resolve
     * @returns {Result<T,E>} - resolved result
     */
    static fromAsync(p) {
        return new KResult((async () => {
            const r = await p;
            const isOk = await r.isOk();
            if (isOk) {
                const ok = await r.unwrap();
                return Promise.resolve(["ok", ok]);
            }
            else {
                const err = await r.unwrapErr();
                return Promise.resolve(["err", err]);
            }
        })());
    }
    // Create a Result from async function
    /**
     * @template T,E
     * @param fn - function that results in a Result, asynchronous
     * @returns {Result<T,E>} - resolved result
     */
    static async(fn) {
        return Res.fromAsync(fn());
    }
    // takes in a list of results and returns a new result with a list of ok values if all results are ok or a list of error values if at least one result is an error
    /**
     * @template
     * @param i - list of results
     */
    static all(...i) {
        const closure = async () => {
            const ok = [];
            const err = [];
            const r = i.map(async (e) => {
                const isOk = await e.isOk();
                if (isOk) {
                    const okR = await e.unwrap();
                    return ["ok", okR];
                }
                else {
                    const errR = await e.unwrapErr();
                    return ["err", errR];
                }
            });
            const a = await Promise.all(r);
            for (const [t, v] of a) {
                if (t === "ok") {
                    ok.push(v);
                }
                else {
                    err.push(v);
                }
            }
            if (err.length > 0) {
                return Err(err);
            }
            return Ok(ok);
        };
        return Res.fromAsync(closure());
    }
}
class KResult {
    value;
    constructor(value) {
        this.value = value;
    }
    andThen(fn) {
        const wrapped = async () => {
            const [type, val] = await this.value;
            if (type === "err") {
                return [type, val];
            }
            else {
                const mapped = await fn(val);
                const mType = await mapped.isOk();
                if (mType) {
                    const okVal = await Promise.resolve(mapped.unwrap());
                    return ["ok", okVal];
                }
                else {
                    const errVal = await Promise.resolve(mapped.unwrapErr());
                    return ["err", errVal];
                }
            }
        };
        return new KResult(wrapped());
    }
    async isOk() {
        const [type] = await this.value;
        return type === "ok";
    }
    async isErr() {
        const [type] = await this.value;
        return type === "err";
    }
    async unwrap() {
        const [type, val] = await this.value;
        if (type === "ok") {
            return val;
        }
        throw new UnwrapError("Failed to unwrap", "result", "Expected Ok got Error");
    }
    async unwrapErr() {
        const [type, val] = await this.value;
        if (type === "err") {
            return val;
        }
        throw new UnwrapError("Failed to unwrap", "result", "Expected Err got Ok");
    }
    map(mapper) {
        return new KResult((async () => {
            const [type, val] = await this.value;
            if (type === "ok") {
                const mapped = await mapper(val);
                return ["ok", mapped];
            }
            else {
                return ["err", val];
            }
        })());
    }
    mapErr(mapper) {
        return new KResult((async () => {
            const [type, val] = await this.value;
            if (type === "err") {
                const err = await mapper(val);
                return ["err", err];
            }
            else {
                return [type, val];
            }
        })());
    }
    async native() {
        const [, val] = await this.value;
        return val;
    }
    async match(fn) {
        const [type, val] = await this.value;
        if (type === "ok") {
            return Promise.resolve(fn.ok(val));
        }
        else {
            return Promise.resolve(fn.err(val));
        }
    }
    async unwrapOr(i) {
        const [type, val] = await this.value;
        if (type === "ok") {
            return val;
        }
        else {
            if (typeof i === "function") {
                const f = i;
                return f(val);
            }
            else {
                return Promise.resolve(i);
            }
        }
    }
    err() {
        const closure = async () => {
            const [t, v] = await this.value;
            if (t === "err") {
                return ["some", v];
            }
            else {
                return ["none", null];
            }
        };
        return new KOption(closure());
    }
    exec(sideEffect, mapper = (e) => {
        if (e instanceof Error) {
            return Promise.resolve(e);
        }
        else {
            return Promise.resolve(new Error(JSON.stringify(e)));
        }
    }) {
        const closure = async () => {
            const [t, v] = await this.value;
            if (t === "err") {
                const err = await mapper(v);
                return [t, err];
            }
            else {
                try {
                    await sideEffect(v);
                }
                catch (e) {
                    if (e instanceof Error) {
                        return ["err", e];
                    }
                    else if (typeof e === "string") {
                        return ["err", new Error(e)];
                    }
                    else {
                        return ["err", new Error(JSON.stringify(e))];
                    }
                }
                return [t, v];
            }
        };
        return new KResult(closure());
    }
    ok() {
        const closure = async () => {
            const [t, v] = await this.value;
            if (t === "ok") {
                return ["some", v];
            }
            else {
                return ["none", null];
            }
        };
        return new KOption(closure());
    }
    run(sideEffect) {
        return new KResult((async () => {
            const [t, v] = await this.value;
            if (t === "err") {
                return [t, v];
            }
            else {
                await sideEffect(v);
                return [t, v];
            }
        })());
    }
}
export { Err, Ok, Res, KResult };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9jb3JlL3Jlc3VsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3pDLE9BQU8sRUFBZ0IsT0FBTyxFQUFVLE1BQU0sYUFBYSxDQUFDO0FBRTVELDJEQUEyRDtBQUMzRDs7OztHQUlHO0FBQ0gsU0FBUyxHQUFHLENBQU8sS0FBcUI7SUFDdEMsT0FBTyxJQUFJLE9BQU8sQ0FDaEIsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNWLE1BQU0sR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQyxDQUFDLEVBQUUsQ0FDTCxDQUFDO0FBQ0osQ0FBQztBQUVELDBEQUEwRDtBQUMxRDs7OztHQUlHO0FBQ0gsU0FBUyxFQUFFLENBQWUsR0FBbUI7SUFDM0MsT0FBTyxJQUFJLE9BQU8sQ0FDaEIsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNWLE1BQU0sQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkIsQ0FBQyxDQUFDLEVBQUUsQ0FDTCxDQUFDO0FBQ0osQ0FBQztBQXFCRCxNQUFNLEdBQUc7SUFDUCw0RkFBNEY7SUFDNUY7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxTQUFTLENBQU8sQ0FBd0I7UUFDN0MsT0FBTyxJQUFJLE9BQU8sQ0FDaEIsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNWLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzVCLElBQUksSUFBSSxFQUFFO2dCQUNSLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLE1B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fSBmcm9tIFwiLi9lcnJvci5qc1wiO1xuaW1wb3J0IHsgSU5vbmUsIElTb21lLCBLT3B0aW9uLCBPcHRpb24gfSBmcm9tIFwiLi9vcHRpb24uanNcIjtcblxuLy8gQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBgUmVzdWx0YCBhcyB0aGUgYGVycmAgdmFyaWFudC5cbi8qKlxuICogQHRlbXBsYXRlIFQsWFxuICogQHBhcmFtIGVycm9yIC0gZXJyb3IgdG8gYmUgY29udmVydGVkIHRvIGEgUmVzdWx0XG4gKiBAcmV0dXJucyB7UmVzdWx0PFQsWD59IC0gbmV3IGluc3RhbmNlIG9mIGBSZXN1bHRgIGFzIHRoZSBgZXJyYCB2YXJpYW50XG4gKi9cbmZ1bmN0aW9uIEVycjxULCBYPihlcnJvcjogWCB8IFByb21pc2U8WD4pOiBSZXN1bHQ8VCwgWD4ge1xuICByZXR1cm4gbmV3IEtSZXN1bHQ8VCwgWD4oXG4gICAgKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGVyciA9IGF3YWl0IGVycm9yO1xuICAgICAgcmV0dXJuIFtcImVyclwiLCBlcnJdO1xuICAgIH0pKClcbiAgKTtcbn1cblxuLy8gQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBgUmVzdWx0YCBhcyB0aGUgYG9rYCB2YXJpYW50LlxuLyoqXG4gKiBAdGVtcGxhdGUgVCxYXG4gKiBAcGFyYW0gdmFsIC0gdmFsdWUgdG8gYmUgY29udmVydGVkIHRvIGEgUmVzdWx0XG4gKiBAcmV0dXJucyB7UmVzdWx0PFQsWD59IC0gbmV3IGluc3RhbmNlIG9mIGBSZXN1bHRgIGFzIHRoZSBgb2tgIHZhcmlhbnRcbiAqL1xuZnVuY3Rpb24gT2s8VCwgWCA9IG5ldmVyPih2YWw6IFQgfCBQcm9taXNlPFQ+KTogUmVzdWx0PFQsIFg+IHtcbiAgcmV0dXJuIG5ldyBLUmVzdWx0PFQsIFg+KFxuICAgIChhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB2ID0gYXdhaXQgdmFsO1xuICAgICAgcmV0dXJuIFtcIm9rXCIsIHZdO1xuICAgIH0pKClcbiAgKTtcbn1cblxuaW50ZXJmYWNlIE1hdGNoPFQsIEUsIFU+IHtcbiAgb2s6ICgodmFsOiBUKSA9PiBQcm9taXNlPFU+KSB8ICgodmFsOiBUKSA9PiBVKTtcbiAgZXJyOiAoKHZhbDogRSkgPT4gUHJvbWlzZTxVPikgfCAoKHZhbDogRSkgPT4gVSk7XG59XG5cbnR5cGUgUmVzdWx0RXJyPFQgZXh0ZW5kcyBSZXN1bHQ8dW5rbm93biwgdW5rbm93bj5bXT4gPSBUIGV4dGVuZHMgQXJyYXk8XG4gIFJlc3VsdDx1bmtub3duLCBpbmZlciBFPlxuPlxuICA/IEVbXVxuICA6IG5ldmVyO1xuXG50eXBlIFJlc3VsdE9rPFQgZXh0ZW5kcyBSZXN1bHQ8dW5rbm93biwgdW5rbm93bj5bXT4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBLIGV4dGVuZHMgbnVtYmVyXG4gICAgPyBUW0tdIGV4dGVuZHMgUmVzdWx0PGluZmVyIFUsIHVua25vd24+XG4gICAgICA/IFVcbiAgICAgIDogbmV2ZXJcbiAgICA6IG5ldmVyO1xufTtcblxuY2xhc3MgUmVzIHtcbiAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBvZiBhIHJlc3VsdCwgUHJvbWlzZTxSZXN1bHQ8VCwgRT4+IHRvIFJlc3VsdDxULEU+IHdpdGhvdXQgYXN5bmMvYXdhaXRcbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSBULEVcbiAgICogQHBhcmFtIHAgLSBwcm9taXNlIG9mIGEgcmVzdWx0IHRvIHJlc29sdmVcbiAgICogQHJldHVybnMge1Jlc3VsdDxULEU+fSAtIHJlc29sdmVkIHJlc3VsdFxuICAgKi9cbiAgc3RhdGljIGZyb21Bc3luYzxULCBFPihwOiBQcm9taXNlPFJlc3VsdDxULCBFPj4pOiBSZXN1bHQ8VCwgRT4ge1xuICAgIHJldHVybiBuZXcgS1Jlc3VsdDxULCBFPihcbiAgICAgIChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHIgPSBhd2FpdCBwO1xuICAgICAgICBjb25zdCBpc09rID0gYXdhaXQgci5pc09rKCk7XG4gICAgICAgIGlmIChpc09rKSB7XG4gICAgICAgICAgY29uc3Qgb2sgPSBhd2FpdCByLnVud3JhcCgpO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW1wib2tcIiwgb2tdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBlcnIgPSBhd2FpdCByLnVud3JhcEVycigpO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW1wiZXJyXCIsIGVycl0pO1xuICAgICAgICB9XG4gICAgICB9KSgpXG4gICAgKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBhIFJlc3VsdCBmcm9tIGFzeW5jIGZ1bmN0aW9uXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgVCxFXG4gICAqIEBwYXJhbSBmbiAtIGZ1bmN0aW9uIHRoYXQgcmVzdWx0cyBpbiBhIFJlc3VsdCwgYXN5bmNocm9ub3VzXG4gICAqIEByZXR1cm5zIHtSZXN1bHQ8VCxFPn0gLSByZXNvbHZlZCByZXN1bHRcbiAgICovXG4gIHN0YXRpYyBhc3luYzxULCBFPihmbjogKCkgPT4gUHJvbWlzZTxSZXN1bHQ8VCwgRT4+KTogUmVzdWx0PFQsIEU+IHtcbiAgICByZXR1cm4gUmVzLmZyb21Bc3luYyhmbigpKTtcbiAgfVxuXG4gIC8vIHRha2VzIGluIGEgbGlzdCBvZiByZXN1bHRzIGFuZCByZXR1cm5zIGEgbmV3IHJlc3VsdCB3aXRoIGEgbGlzdCBvZiBvayB2YWx1ZXMgaWYgYWxsIHJlc3VsdHMgYXJlIG9rIG9yIGEgbGlzdCBvZiBlcnJvciB2YWx1ZXMgaWYgYXQgbGVhc3Qgb25lIHJlc3VsdCBpcyBhbiBlcnJvclxuICAvKipcbiAgICogQHRlbXBsYXRlXG4gICAqIEBwYXJhbSBpIC0gbGlzdCBvZiByZXN1bHRzXG4gICAqL1xuICBzdGF0aWMgYWxsPFQgZXh0ZW5kcyBSZXN1bHQ8dW5rbm93biwgdW5rbm93bj5bXT4oXG4gICAgLi4uaTogWy4uLlRdXG4gICk6IFJlc3VsdDxSZXN1bHRPazxUPiwgUmVzdWx0RXJyPFQ+PiB7XG4gICAgY29uc3QgY2xvc3VyZSA9IGFzeW5jICgpOiBQcm9taXNlPFJlc3VsdDxSZXN1bHRPazxUPiwgUmVzdWx0RXJyPFQ+Pj4gPT4ge1xuICAgICAgY29uc3Qgb2s6IFJlc3VsdE9rPFQ+ID0gW10gYXMgdW5rbm93biBhcyBSZXN1bHRPazxUPjtcbiAgICAgIGNvbnN0IGVycjogUmVzdWx0RXJyPFQ+ID0gW10gYXMgdW5rbm93biBhcyBSZXN1bHRFcnI8VD47XG4gICAgICBjb25zdCByID0gaS5tYXAoYXN5bmMgKGUpID0+IHtcbiAgICAgICAgY29uc3QgaXNPayA9IGF3YWl0IGUuaXNPaygpO1xuICAgICAgICBpZiAoaXNPaykge1xuICAgICAgICAgIGNvbnN0IG9rUiA9IGF3YWl0IGUudW53cmFwKCk7XG4gICAgICAgICAgcmV0dXJuIFtcIm9rXCIsIG9rUl0gYXMgW1wib2tcIiwgUmVzdWx0T2s8VD5bbnVtYmVyXV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXJyUiA9IGF3YWl0IGUudW53cmFwRXJyKCk7XG4gICAgICAgICAgcmV0dXJuIFtcImVyclwiLCBlcnJSXSBhcyBbXCJlcnJcIiwgUmVzdWx0RXJyPFQ+W251bWJlcl1dO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGEgPSBhd2FpdCBQcm9taXNlLmFsbChyKTtcbiAgICAgIGZvciAoY29uc3QgW3QsIHZdIG9mIGEpIHtcbiAgICAgICAgaWYgKHQgPT09IFwib2tcIikge1xuICAgICAgICAgIG9rLnB1c2godik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXJyLnB1c2godik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChlcnIubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gRXJyKGVycik7XG4gICAgICB9XG4gICAgICByZXR1cm4gT2sob2spO1xuICAgIH07XG4gICAgcmV0dXJuIFJlcy5mcm9tQXN5bmMoY2xvc3VyZSgpKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgUmVzdWx0PFQsIEU+IHtcbiAgLy8gcmV0dXJucyBhIFByb21pc2Ugb2YgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgdmFyaWFudCBvZiB0aGUgUmVzdWx0IGlzIFwib2tcIlxuICAvKipcbiAgICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IC0gYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHZhcmlhbnQgb2YgdGhlIFJlc3VsdCBpcyBcIm9rXCJcbiAgICovXG4gIGlzT2soKTogUHJvbWlzZTxib29sZWFuPjtcblxuICAvLyByZXR1cm5zIGEgUHJvbWlzZSBvZiBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB2YXJpYW50IG9mIHRoZSBSZXN1bHQgaXMgXCJlcnJcIlxuICAvKipcbiAgICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IC0gYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHZhcmlhbnQgb2YgdGhlIFJlc3VsdCBpcyBcImVyclwiXG4gICAqL1xuICBpc0VycigpOiBQcm9taXNlPGJvb2xlYW4+O1xuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxUPn0gLSBwcm9taXNlIG9mIHRoZSB1bndyYXBwZWQgdmFsdWVcbiAgICogQHRocm93cyB7VW53cmFwRXJyb3J9IC0gaWYgdGhlIHZhcmlhbnQgb2YgdGhlIFJlc3VsdCBpcyBcImVyclwiXG4gICAqL1xuICAvLyByZXR1cm5zIGEgUHJvbWlzZSBvZiB0aGUgdmFsdWUgb2YgdGhlIFJlc3VsdCBpZiBpdHMgdmFyaWFudCBpcyBcIm9rXCIuIElmIGl0cyB2YXJpYW50IGlzIFwiZXJyXCIsIGl0IHRocm93cyBhbiBlcnJvci5cbiAgdW53cmFwKCk6IFByb21pc2U8VD47XG5cbiAgLy8gcmV0dXJucyBhIFByb21pc2Ugb2YgdGhlIHZhbHVlIG9mIHRoZSBSZXN1bHQgaWYgaXRzIHZhcmlhbnQgaXMgXCJva1wiLCBvdGhlcndpc2UgaXQgcmV0dXJucyB0aGUgcHJvdmlkZWQgZGVmYXVsdCB2YWx1ZS5cbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwYXJhbSBpIC0gZGVmYXVsdCB2YWx1ZSB0byBiZSByZXR1cm5lZCBpZiB0aGUgdmFyaWFudCBvZiB0aGUgUmVzdWx0IGlzIFwiZXJyXCIuIEl0IGNhbiBiZSB0aGUgZGVmYXVsdCB2YWx1ZSwgcHJvbWlzZWQgdmFsdWUsIG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgZGVmYXVsdCB2YWx1ZSBvciBhc3luYyBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGRlZmF1bHQgdmFsdWVcbiAgICogQHJldHVybnMge1Byb21pc2U8VD59IC0gcHJvbWlzZSBvZiB0aGUgdW53cmFwcGVkIHZhbHVlXG4gICAqL1xuICB1bndyYXBPcihcbiAgICBpOiBUIHwgUHJvbWlzZTxUPiB8ICgoZXJyOiBFKSA9PiBQcm9taXNlPFQ+KSB8ICgoZXJyOiBFKSA9PiBUKVxuICApOiBQcm9taXNlPFQ+O1xuXG4gIC8vIHJldHVybnMgYSBQcm9taXNlIG9mIHRoZSBlcnJvciB2YWx1ZSBvZiB0aGUgUmVzdWx0IGlmIGl0cyB2YXJpYW50IGlzIFwiZXJyXCIuIElmIGl0cyB2YXJpYW50IGlzIFwib2tcIiwgaXQgdGhyb3dzIGFuIGVycm9yXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgRVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxFPn0gLSBwcm9taXNlIG9mIHRoZSB1bndyYXBwZWQgZXJyb3IgdmFsdWVcbiAgICogQHRocm93cyB7VW53cmFwRXJyb3J9IC0gaWYgdGhlIHZhcmlhbnQgb2YgdGhlIFJlc3VsdCBpcyBcIm9rXCJcbiAgICovXG4gIHVud3JhcEVycigpOiBQcm9taXNlPEU+O1xuXG4gIC8vIGFwcGxpZXMgYSBtYXBwZXIgZnVuY3Rpb24gdG8gdGhlIHZhbHVlIG9mIHRoZSBSZXN1bHQgaWYgaXRzIHZhcmlhbnQgaXMgXCJva1wiIGFuZCByZXR1cm5zIGEgbmV3IFJlc3VsdCB3aXRoIHRoZSBtYXBwZWQgdmFsdWUuIElmIGl0cyB2YXJpYW50IGlzIFwiZXJyXCIsIGl0IHJldHVybnMgdGhlIG9yaWdpbmFsIFJlc3VsdC5cbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSBZLCBFXG4gICAqIEBwYXJhbSBtYXBwZXIgLSBmdW5jdGlvbiB0byBtYXAgdGhlIHZhbHVlIG9mIHRoZSBSZXN1bHQuIG1hcHBlciBjYW4gYmUgYXN5bmMuXG4gICAqIEByZXR1cm5zIHtSZXN1bHQ8WSxFPn0gLSBuZXcgUmVzdWx0IHdpdGggdGhlIG1hcHBlZCB2YWx1ZVxuICAgKi9cbiAgbWFwPFk+KG1hcHBlcjogKChhOiBUKSA9PiBQcm9taXNlPFk+KSB8ICgoYTogVCkgPT4gWSkpOiBSZXN1bHQ8WSwgRT47XG5cbiAgLy8gYXBwbGllcyBhIG1hcHBlciBmdW5jdGlvbiB0byB0aGUgZXJyb3IgdmFsdWUgb2YgdGhlIFJlc3VsdCBpZiBpdHMgdmFyaWFudCBpcyBcImVyclwiIGFuZCByZXR1cm5zIGEgbmV3IFJlc3VsdCB3aXRoIHRoZSBtYXBwZWQgZXJyb3IgdmFsdWUuIElmIGl0cyB2YXJpYW50IGlzIFwib2tcIiwgaXQgcmV0dXJucyB0aGUgb3JpZ2luYWwgUmVzdWx0LlxuICAvKipcbiAgICogQHRlbXBsYXRlIFksIFRcbiAgICogQHBhcmFtIG1hcHBlciAtIGZ1bmN0aW9uIHRvIG1hcCB0aGUgZXJyb3IgdmFsdWUgb2YgdGhlIFJlc3VsdC4gbWFwcGVyIGNhbiBiZSBhc3luYy5cbiAgICogQHJldHVybnMge1Jlc3VsdDxULFk+fSAtIG5ldyBSZXN1bHQgd2l0aCB0aGUgbWFwcGVkIGVycm9yIHZhbHVlXG4gICAqL1xuICBtYXBFcnI8WT4obWFwcGVyOiAoKGE6IEUpID0+IFByb21pc2U8WT4pIHwgKChhOiBFKSA9PiBZKSk6IFJlc3VsdDxULCBZPjtcblxuICAvLyByZXR1cm5zIGEgUHJvbWlzZSBvZiB0aGUgdmFsdWUgb3IgZXJyb3Igb2YgdGhlIFJlc3VsdCByZWdhcmRsZXNzIG9mIGl0cyB2YXJpYW50LlxuICAvKipcbiAgICogQHRlbXBsYXRlIFQsIEVcbiAgICogQHJldHVybnMge1Byb21pc2U8VCB8IEU+fSAtIHByb21pc2Ugb2YgdGhlIHZhbHVlIG9yIGVycm9yIG9mIHRoZSBSZXN1bHRcbiAgICovXG4gIG5hdGl2ZSgpOiBQcm9taXNlPFQgfCBFPjtcblxuICAvLyBtZXRob2QgdGhhdCB0YWtlcyBpbiBhIGZ1bmN0aW9uIGZuIHdpdGggb2sgYW5kIGVyciBjYXNlcy4gSXQgYXBwbGllcyB0aGUgY29ycmVzcG9uZGluZyBjYXNlIGJhc2VkIG9uIHRoZSB2YXJpYW50IG9mIHRoZSBSZXN1bHQgYW5kIHJldHVybnMgdGhlIHJlc3VsdCBvZiB0aGF0IGNhc2UgYXMgYSBQcm9taXNlLlxuICAvKipcbiAgICogQHRlbXBsYXRlIFVcbiAgICogQHBhcmFtIGZuIC0gZnVuY3Rpb24gd2l0aCBvayBhbmQgZXJyIGNhc2VzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPFU+fSAtIHByb21pc2Ugb2YgdGhlIHJlc3VsdCBvZiB0aGUgY29ycmVzcG9uZGluZyBjYXNlXG4gICAqL1xuICBtYXRjaDxVPihmbjogTWF0Y2g8VCwgRSwgVT4pOiBQcm9taXNlPFU+O1xuXG4gIC8vIFRha2VzIGluIGEgZnVuY3Rpb24gdGhhdCBtYXBzIHRoZSBvayB2YWx1ZSBvZiB0aGUgUmVzdWx0IHRvIGEgbmV3IFJlc3VsdCwgaWYgdGhlIFJlc3VsdCBpcyBvay5cbiAgLy8gUmV0dXJucyB0aGUgbmV3IFJlc3VsdCB0aGF0IHdhcyBtYXBwZWQgZnJvbSB0aGUgb3JpZ2luYWwgUmVzdWx0LlxuICAvLyBJZiB0aGUgUmVzdWx0IGlzIGFuIGVycm9yLCB0aGUgZnVuY3Rpb24gaXMgbm90IGNhbGxlZCwgYW5kIHRoZSBvcmlnaW5hbCBlcnJvciBSZXN1bHQgaXMgcmV0dXJuZWQuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgVVxuICAgKiBAcGFyYW0gZm4gLSBmdW5jdGlvbiB0aGF0IG1hcHMgdGhlIG9rIHZhbHVlIG9mIHRoZSBSZXN1bHQgdG8gYSBuZXcgUmVzdWx0LiBmbiBjYW4gYmUgYXN5bmMuXG4gICAqIEByZXR1cm5zIHtSZXN1bHQ8VSxFPn0gLSBuZXcgUmVzdWx0IHRoYXQgd2FzIG1hcHBlZCBmcm9tIHRoZSBvcmlnaW5hbCBSZXN1bHRcbiAgICovXG4gIGFuZFRoZW48VT4oXG4gICAgZm46ICgodmFsOiBUKSA9PiBSZXN1bHQ8VSwgRT4pIHwgKCh2YWw6IFQpID0+IFByb21pc2U8UmVzdWx0PFUsIEU+PilcbiAgKTogUmVzdWx0PFUsIEU+O1xuXG4gIC8vIFJ1bnMgdGhlIGZ1bmN0aW9uIHBhc3NlZCBpbiBidXQgZG9lcyBub3QgY2FwdHVyZSB0aGUgcmV0dXJuIHZhbHVlLlxuICAvLyBBY2NlcHRzIGJvdGggc3luYyBhbmQgYXN5bmMgZnVuY3Rpb25zLlxuICAvLyAqKkRvZXMgbm90IGhhbmRsZSBleGNlcHRpb25zKipcbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwYXJhbSBzaWRlRWZmZWN0IC0gU2lkZSBlZmZlY3QgdG8gZXhlY3V0ZS4gQ2FuIGJlIHN5bmMgb3IgYXN5bmNcbiAgICogQHJldHVybnMge1Jlc3VsdDxULEU+fSAtIG9yaWdpbmFsIFJlc3VsdFxuICAgKi9cbiAgcnVuKHNpZGVFZmZlY3Q6ICgodDogVCkgPT4gdm9pZCkgfCAoKHQ6IFQpID0+IFByb21pc2U8dm9pZD4pKTogUmVzdWx0PFQsIEU+O1xuXG4gIC8vIFJ1bnMgdGhlIGZ1bmN0aW9uIHBhc3NlZCBpbiBidXQgZG9lcyBub3QgY2FwdHVyZSB0aGUgcmV0dXJuIHZhbHVlLlxuICAvLyBBY2NlcHRzIGJvdGggc3luYyBhbmQgYXN5bmMgZnVuY3Rpb25zLlxuICAvLyAqKkhhbmRsZXMgZXhjZXB0aW9ucyoqXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAcGFyYW0gc2lkZUVmZmVjdCAgLSBTaWRlIGVmZmVjdCB0byBleGVjdXRlLiBDYW4gYmUgc3luYyBvciBhc3luY1xuICAgKiBAcGFyYW0gbWFwcGVyIC0gZnVuY3Rpb24gdG8gbWFwIHRoZSBlcnJvciB2YWx1ZSBvZiB0aGUgUmVzdWx0LiBtYXBwZXIgY2FuIGJlIGFzeW5jLlxuICAgKiBAcmV0dXJucyB7UmVzdWx0PFQsRT59IC0gb3JpZ2luYWwgUmVzdWx0XG4gICAqL1xuICBleGVjKFxuICAgIHNpZGVFZmZlY3Q6ICgodDogVCkgPT4gdm9pZCkgfCAoKHQ6IFQpID0+IFByb21pc2U8dm9pZD4pLFxuICAgIG1hcHBlcj86IChlOiBFKSA9PiBFcnJvciB8IFByb21pc2U8RXJyb3I+XG4gICk6IFJlc3VsdDxULCBFcnJvcj47XG5cbiAgLy8gUmV0dXJucyBhbiBPcHRpb24gb2YgdGhlIE9rIHJlc3VsdC4gRXJyb3Igd2lsbCByZXN1bHQgaW4gTm9uZVxuICAvKipcbiAgICogQHRlbXBsYXRlIFRcbiAgICogQHJldHVybnMge09wdGlvbjxUPn0gLSBPcHRpb24gb2YgdGhlIE9rIHJlc3VsdFxuICAgKi9cbiAgb2soKTogT3B0aW9uPFQ+O1xuXG4gIC8vIFJldHVybnMgYW4gT3B0aW9uIG9mIHRoZSBFcnJvciByZXN1bHQuIE9rIHdpbGwgcmVzdWx0IGluIE5vbmVcbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSBFXG4gICAqIEByZXR1cm5zIHtPcHRpb248RT59IC0gT3B0aW9uIG9mIHRoZSBFcnJvciByZXN1bHRcbiAgICovXG4gIGVycigpOiBPcHRpb248RT47XG59XG5cbmNsYXNzIEtSZXN1bHQ8VCwgWD4gaW1wbGVtZW50cyBSZXN1bHQ8VCwgWD4ge1xuICB2YWx1ZTpcbiAgICB8IFByb21pc2U8W1wib2tcIiwgVF0+XG4gICAgfCBQcm9taXNlPFtcImVyclwiLCBYXT5cbiAgICB8IFByb21pc2U8W1wiZXJyXCIsIFhdIHwgW1wib2tcIiwgVF0+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHZhbHVlOlxuICAgICAgfCBQcm9taXNlPFtcIm9rXCIsIFRdPlxuICAgICAgfCBQcm9taXNlPFtcImVyclwiLCBYXT5cbiAgICAgIHwgUHJvbWlzZTxbXCJlcnJcIiwgWF0gfCBbXCJva1wiLCBUXT5cbiAgKSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgYW5kVGhlbjxVPihcbiAgICBmbjogKCh2YWw6IFQpID0+IFJlc3VsdDxVLCBYPikgfCAoKHZhbDogVCkgPT4gUHJvbWlzZTxSZXN1bHQ8VSwgWD4+KVxuICApOiBSZXN1bHQ8VSwgWD4ge1xuICAgIGNvbnN0IHdyYXBwZWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBbdHlwZSwgdmFsXSA9IGF3YWl0IHRoaXMudmFsdWU7XG4gICAgICBpZiAodHlwZSA9PT0gXCJlcnJcIikge1xuICAgICAgICByZXR1cm4gW3R5cGUsIHZhbF0gYXMgW1wiZXJyXCIsIFhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbWFwcGVkID0gYXdhaXQgZm4odmFsKTtcbiAgICAgICAgY29uc3QgbVR5cGUgPSBhd2FpdCBtYXBwZWQuaXNPaygpO1xuICAgICAgICBpZiAobVR5cGUpIHtcbiAgICAgICAgICBjb25zdCBva1ZhbCA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShtYXBwZWQudW53cmFwKCkpO1xuICAgICAgICAgIHJldHVybiBbXCJva1wiLCBva1ZhbF0gYXMgW1wib2tcIiwgVV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXJyVmFsID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKG1hcHBlZC51bndyYXBFcnIoKSk7XG4gICAgICAgICAgcmV0dXJuIFtcImVyclwiLCBlcnJWYWxdIGFzIFtcImVyclwiLCBYXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBLUmVzdWx0PFUsIFg+KHdyYXBwZWQoKSk7XG4gIH1cblxuICBhc3luYyBpc09rKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IFt0eXBlXSA9IGF3YWl0IHRoaXMudmFsdWU7XG4gICAgcmV0dXJuIHR5cGUgPT09IFwib2tcIjtcbiAgfVxuXG4gIGFzeW5jIGlzRXJyKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IFt0eXBlXSA9IGF3YWl0IHRoaXMudmFsdWU7XG4gICAgcmV0dXJuIHR5cGUgPT09IFwiZXJyXCI7XG4gIH1cblxuICBhc3luYyB1bndyYXAoKTogUHJvbWlzZTxUPiB8IG5ldmVyIHtcbiAgICBjb25zdCBbdHlwZSwgdmFsXSA9IGF3YWl0IHRoaXMudmFsdWU7XG4gICAgaWYgKHR5cGUgPT09IFwib2tcIikge1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgdGhyb3cgbmV3IFVud3JhcEVycm9yKFxuICAgICAgXCJGYWlsZWQgdG8gdW53cmFwXCIsXG4gICAgICBcInJlc3VsdFwiLFxuICAgICAgXCJFeHBlY3RlZCBPayBnb3QgRXJyb3JcIlxuICAgICk7XG4gIH1cblxuICBhc3luYyB1bndyYXBFcnIoKTogUHJvbWlzZTxYPiB8IG5ldmVyIHtcbiAgICBjb25zdCBbdHlwZSwgdmFsXSA9IGF3YWl0IHRoaXMudmFsdWU7XG4gICAgaWYgKHR5cGUgPT09IFwiZXJyXCIpIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHRocm93IG5ldyBVbndyYXBFcnJvcihcIkZhaWxlZCB0byB1bndyYXBcIiwgXCJyZXN1bHRcIiwgXCJFeHBlY3RlZCBFcnIgZ290IE9rXCIpO1xuICB9XG5cbiAgbWFwPFk+KG1hcHBlcjogKChhOiBUKSA9PiBQcm9taXNlPFk+KSB8ICgoYTogVCkgPT4gWSkpOiBSZXN1bHQ8WSwgWD4ge1xuICAgIHJldHVybiBuZXcgS1Jlc3VsdDxZLCBYPihcbiAgICAgIChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IFt0eXBlLCB2YWxdID0gYXdhaXQgdGhpcy52YWx1ZTtcbiAgICAgICAgaWYgKHR5cGUgPT09IFwib2tcIikge1xuICAgICAgICAgIGNvbnN0IG1hcHBlZDogWSA9IGF3YWl0IG1hcHBlcih2YWwpO1xuICAgICAgICAgIHJldHVybiBbXCJva1wiLCBtYXBwZWRdIGFzIFtcIm9rXCIsIFldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbXCJlcnJcIiwgdmFsXSBhcyBbXCJlcnJcIiwgWF07XG4gICAgICAgIH1cbiAgICAgIH0pKClcbiAgICApO1xuICB9XG5cbiAgbWFwRXJyPFk+KG1hcHBlcjogKChhOiBYKSA9PiBQcm9taXNlPFk+KSB8ICgoYTogWCkgPT4gWSkpOiBSZXN1bHQ8VCwgWT4ge1xuICAgIHJldHVybiBuZXcgS1Jlc3VsdDxULCBZPihcbiAgICAgIChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IFt0eXBlLCB2YWxdID0gYXdhaXQgdGhpcy52YWx1ZTtcbiAgICAgICAgaWYgKHR5cGUgPT09IFwiZXJyXCIpIHtcbiAgICAgICAgICBjb25zdCBlcnIgPSBhd2FpdCBtYXBwZXIodmFsKTtcbiAgICAgICAgICByZXR1cm4gW1wiZXJyXCIsIGVycl0gYXMgW1wiZXJyXCIsIFldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbdHlwZSwgdmFsXSBhcyBbXCJva1wiLCBUXTtcbiAgICAgICAgfVxuICAgICAgfSkoKVxuICAgICk7XG4gIH1cblxuICBhc3luYyBuYXRpdmUoKTogUHJvbWlzZTxUIHwgWD4ge1xuICAgIGNvbnN0IFssIHZhbF0gPSBhd2FpdCB0aGlzLnZhbHVlO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICBhc3luYyBtYXRjaDxVPihmbjogTWF0Y2g8VCwgWCwgVT4pOiBQcm9taXNlPFU+IHtcbiAgICBjb25zdCBbdHlwZSwgdmFsXSA9IGF3YWl0IHRoaXMudmFsdWU7XG4gICAgaWYgKHR5cGUgPT09IFwib2tcIikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmbi5vayh2YWwpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmbi5lcnIodmFsKSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgdW53cmFwT3IoXG4gICAgaTogUHJvbWlzZTxUPiB8ICgoZXJyOiBYKSA9PiBQcm9taXNlPFQ+KSB8ICgoZXJyOiBYKSA9PiBUKSB8IFRcbiAgKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgW3R5cGUsIHZhbF0gPSBhd2FpdCB0aGlzLnZhbHVlO1xuICAgIGlmICh0eXBlID09PSBcIm9rXCIpIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgaSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnN0IGYgPSBpIGFzICgoZXJyOiBYKSA9PiBQcm9taXNlPFQ+KSB8ICgoZXJyOiBYKSA9PiBUKTtcbiAgICAgICAgcmV0dXJuIGYodmFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXJyKCk6IE9wdGlvbjxYPiB7XG4gICAgY29uc3QgY2xvc3VyZSA9IGFzeW5jICgpOiBQcm9taXNlPElTb21lPFg+IHwgSU5vbmU+ID0+IHtcbiAgICAgIGNvbnN0IFt0LCB2XSA9IGF3YWl0IHRoaXMudmFsdWU7XG4gICAgICBpZiAodCA9PT0gXCJlcnJcIikge1xuICAgICAgICByZXR1cm4gW1wic29tZVwiLCB2XSBhcyBbXCJzb21lXCIsIFhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtcIm5vbmVcIiwgbnVsbF0gYXMgW1wibm9uZVwiLCBudWxsXTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBuZXcgS09wdGlvbjxYPihjbG9zdXJlKCkpO1xuICB9XG5cbiAgZXhlYyhcbiAgICBzaWRlRWZmZWN0OiAoKHQ6IFQpID0+IHZvaWQpIHwgKCh0OiBUKSA9PiBQcm9taXNlPHZvaWQ+KSxcbiAgICBtYXBwZXI6IChlOiBYKSA9PiBFcnJvciB8IFByb21pc2U8RXJyb3I+ID0gKGU6IFgpID0+IHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KGUpKSk7XG4gICAgICB9XG4gICAgfVxuICApOiBSZXN1bHQ8VCwgRXJyb3I+IHtcbiAgICBjb25zdCBjbG9zdXJlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgW3QsIHZdID0gYXdhaXQgdGhpcy52YWx1ZTtcbiAgICAgIGlmICh0ID09PSBcImVyclwiKSB7XG4gICAgICAgIGNvbnN0IGVyciA9IGF3YWl0IG1hcHBlcih2KTtcbiAgICAgICAgcmV0dXJuIFt0LCBlcnJdIGFzIFtcImVyclwiLCBFcnJvcl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHNpZGVFZmZlY3Qodik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gW1wiZXJyXCIsIGVdIGFzIFtcImVyclwiLCBFcnJvcl07XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIFtcImVyclwiLCBuZXcgRXJyb3IoZSldIGFzIFtcImVyclwiLCBFcnJvcl07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbXCJlcnJcIiwgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KGUpKV0gYXMgW1wiZXJyXCIsIEVycm9yXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFt0LCB2XSBhcyBbXCJva1wiLCBUXTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBuZXcgS1Jlc3VsdDxULCBFcnJvcj4oY2xvc3VyZSgpKTtcbiAgfVxuXG4gIG9rKCk6IE9wdGlvbjxUPiB7XG4gICAgY29uc3QgY2xvc3VyZSA9IGFzeW5jICgpOiBQcm9taXNlPElTb21lPFQ+IHwgSU5vbmU+ID0+IHtcbiAgICAgIGNvbnN0IFt0LCB2XSA9IGF3YWl0IHRoaXMudmFsdWU7XG4gICAgICBpZiAodCA9PT0gXCJva1wiKSB7XG4gICAgICAgIHJldHVybiBbXCJzb21lXCIsIHZdIGFzIFtcInNvbWVcIiwgVF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW1wibm9uZVwiLCBudWxsXSBhcyBbXCJub25lXCIsIG51bGxdO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBLT3B0aW9uPFQ+KGNsb3N1cmUoKSk7XG4gIH1cblxuICBydW4oc2lkZUVmZmVjdDogKCh0OiBUKSA9PiB2b2lkKSB8ICgodDogVCkgPT4gUHJvbWlzZTx2b2lkPikpOiBSZXN1bHQ8VCwgWD4ge1xuICAgIHJldHVybiBuZXcgS1Jlc3VsdDxULCBYPihcbiAgICAgIChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IFt0LCB2XSA9IGF3YWl0IHRoaXMudmFsdWU7XG4gICAgICAgIGlmICh0ID09PSBcImVyclwiKSB7XG4gICAgICAgICAgcmV0dXJuIFt0LCB2XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBzaWRlRWZmZWN0KHYpO1xuICAgICAgICAgIHJldHVybiBbdCwgdl07XG4gICAgICAgIH1cbiAgICAgIH0pKClcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB7IEVyciwgT2ssIFJlc3VsdCwgUmVzLCBLUmVzdWx0IH07XG4iXX0=