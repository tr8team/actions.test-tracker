import { HistoryEntry } from "./inputs.js";

interface Output {
  current: HistoryEntry;
  preImage?: HistoryEntry[];
  afterImage?: HistoryEntry[];
  base?: HistoryEntry;
}

export type { Output };
