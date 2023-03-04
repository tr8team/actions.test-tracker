import { catchToResult } from "../lib/util.js";
import { None, Opt, Some } from "../lib/core/option.js";
import { Err, Ok, Res } from "../lib/core/result.js";
class GistKeyValue {
    octokit;
    gistId;
    constructor(octokit, gistId) {
        this.octokit = octokit;
        this.gistId = gistId;
    }
    delete(key) {
        return Opt.async(async () => {
            try {
                await this.octokit.gists.update({
                    // eslint-disable-next-line camelcase
                    gist_id: this.gistId,
                    files: {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        [`${key}.json`]: null,
                    },
                });
                return None();
            }
            catch (e) {
                return Some(catchToResult(e));
            }
        });
    }
    read(key) {
        return Res.async(async () => {
            try {
                // api call
                const r = await this.octokit.gists.get({
                    // eslint-disable-next-line camelcase
                    gist_id: this.gistId,
                });
                if (r.data.files && r.data.files[`${key}.json`]) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const c = r.data.files[`${key}.json`].content;
                    const o = Some(JSON.parse(c));
                    return Ok(o);
                }
                return Ok(None());
            }
            catch (e) {
                return Err(catchToResult(e));
            }
        });
    }
    write(key, value) {
        return Opt.async(async () => {
            try {
                await this.octokit.gists.update({
                    // eslint-disable-next-line camelcase
                    gist_id: this.gistId,
                    description: "Automated Gist update from test tracker GitHub Action",
                    files: {
                        [`${key}.json`]: {
                            content: JSON.stringify(value),
                        },
                    },
                });
                return None();
            }
            catch (e) {
                return Some(catchToResult(e));
            }
        });
    }
}
export { GistKeyValue };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2lzdC1rZXktdmFsdWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZXJuYWwvZ2lzdC1rZXktdmFsdWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFVLElBQUksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBVSxNQUFNLHVCQUF1QixDQUFDO0FBRTdELE1BQU0sWUFBWTtJQUNoQixPQUFPLENBQVU7SUFDakIsTUFBTSxDQUFTO0lBRWYsWUFBWSxPQUFnQixFQUFFLE1BQWM7UUFDMUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFXO1FBQ2hCLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtZQUMxQixJQUFJO2dCQUNGLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO29CQUM5QixxQ0FBcUM7b0JBQ3JDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTTtvQkFDcEIsS0FBSyxFQUFFO3dCQUNMLDhEQUE4RDt3QkFDOUQsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEVBQUUsSUFBVztxQkFDN0I7aUJBQ0YsQ0FBQyxDQUFDO2dCQUNILE9BQU8sSUFBSSxFQUFFLENBQUM7YUFDZjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSSxDQUFJLEdBQVc7UUFDakIsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQzFCLElBQUk7Z0JBQ0YsV0FBVztnQkFDWCxNQUFNLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztvQkFDckMscUNBQXFDO29CQUNyQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU07aUJBQ3JCLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsRUFBRTtvQkFDL0Msb0VBQW9FO29CQUNwRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFFLENBQUMsT0FBaUIsQ0FBQztvQkFDekQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUIsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2Q7Z0JBQ0QsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUNuQjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzlCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFJLEdBQVcsRUFBRSxLQUFRO1FBQzVCLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtZQUMxQixJQUFJO2dCQUNGLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO29CQUM5QixxQ0FBcUM7b0JBQ3JDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTTtvQkFDcEIsV0FBVyxFQUFFLHVEQUF1RDtvQkFDcEUsS0FBSyxFQUFFO3dCQUNMLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxFQUFFOzRCQUNmLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQzt5QkFDL0I7cUJBQ0Y7aUJBQ0YsQ0FBQyxDQUFDO2dCQUNILE9BQU8sSUFBSSxFQUFFLENBQUM7YUFDZjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFFRCxPQUFPLEVBQUUsWUFBWSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBLZXlWYWx1ZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi4vbGliL2ludGVyZmFjZS9yZXBvLmpzXCI7XG5pbXBvcnQgeyBPY3Rva2l0IH0gZnJvbSBcIkBvY3Rva2l0L3Jlc3RcIjtcbmltcG9ydCB7IGNhdGNoVG9SZXN1bHQgfSBmcm9tIFwiLi4vbGliL3V0aWwuanNcIjtcbmltcG9ydCB7IE5vbmUsIE9wdCwgT3B0aW9uLCBTb21lIH0gZnJvbSBcIi4uL2xpYi9jb3JlL29wdGlvbi5qc1wiO1xuaW1wb3J0IHsgRXJyLCBPaywgUmVzLCBSZXN1bHQgfSBmcm9tIFwiLi4vbGliL2NvcmUvcmVzdWx0LmpzXCI7XG5cbmNsYXNzIEdpc3RLZXlWYWx1ZSBpbXBsZW1lbnRzIEtleVZhbHVlUmVwb3NpdG9yeSB7XG4gIG9jdG9raXQ6IE9jdG9raXQ7XG4gIGdpc3RJZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9jdG9raXQ6IE9jdG9raXQsIGdpc3RJZDogc3RyaW5nKSB7XG4gICAgdGhpcy5vY3Rva2l0ID0gb2N0b2tpdDtcbiAgICB0aGlzLmdpc3RJZCA9IGdpc3RJZDtcbiAgfVxuXG4gIGRlbGV0ZShrZXk6IHN0cmluZyk6IE9wdGlvbjxFcnJvcj4ge1xuICAgIHJldHVybiBPcHQuYXN5bmMoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5vY3Rva2l0Lmdpc3RzLnVwZGF0ZSh7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgICAgICAgIGdpc3RfaWQ6IHRoaXMuZ2lzdElkLFxuICAgICAgICAgIGZpbGVzOiB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgW2Ake2tleX0uanNvbmBdOiBudWxsIGFzIGFueSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIE5vbmUoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIFNvbWUoY2F0Y2hUb1Jlc3VsdChlKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZWFkPFQ+KGtleTogc3RyaW5nKTogUmVzdWx0PE9wdGlvbjxUPiwgRXJyb3I+IHtcbiAgICByZXR1cm4gUmVzLmFzeW5jKGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGFwaSBjYWxsXG4gICAgICAgIGNvbnN0IHIgPSBhd2FpdCB0aGlzLm9jdG9raXQuZ2lzdHMuZ2V0KHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgICAgZ2lzdF9pZDogdGhpcy5naXN0SWQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoci5kYXRhLmZpbGVzICYmIHIuZGF0YS5maWxlc1tgJHtrZXl9Lmpzb25gXSkge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgY29uc3QgYyA9IHIuZGF0YS5maWxlc1tgJHtrZXl9Lmpzb25gXSEuY29udGVudCBhcyBzdHJpbmc7XG4gICAgICAgICAgY29uc3QgbyA9IFNvbWUoSlNPTi5wYXJzZShjKSk7XG4gICAgICAgICAgcmV0dXJuIE9rKG8pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPayhOb25lKCkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gRXJyKGNhdGNoVG9SZXN1bHQoZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgd3JpdGU8VD4oa2V5OiBzdHJpbmcsIHZhbHVlOiBUKTogT3B0aW9uPEVycm9yPiB7XG4gICAgcmV0dXJuIE9wdC5hc3luYyhhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLm9jdG9raXQuZ2lzdHMudXBkYXRlKHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgICAgZ2lzdF9pZDogdGhpcy5naXN0SWQsXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiQXV0b21hdGVkIEdpc3QgdXBkYXRlIGZyb20gdGVzdCB0cmFja2VyIEdpdEh1YiBBY3Rpb25cIixcbiAgICAgICAgICBmaWxlczoge1xuICAgICAgICAgICAgW2Ake2tleX0uanNvbmBdOiB7XG4gICAgICAgICAgICAgIGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KHZhbHVlKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBOb25lKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBTb21lKGNhdGNoVG9SZXN1bHQoZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCB7IEdpc3RLZXlWYWx1ZSB9O1xuIl19