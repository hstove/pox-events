import { join } from "path";
import { dataFolder, fetchTransaction } from "./transactions";
import { readFile } from "fs/promises";
import { Event, CachedPrint } from "./pox-types";
import { hexToCV } from "@stacks/transactions";
import { cvToValue } from "@clarigen/core";
import { cvConvertMS, cvConvertHiro } from "@clarigen/test";

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loadEvents(): Promise<Event[]> {
  const path = join(dataFolder(), "pox-events.json");
  const fileStr = await readFile(path, "utf-8");
  const data = JSON.parse(fileStr) as CachedPrint[];
  // console.log(data.length);
  return Promise.all(
    data.map(async (event) => {
      const cv = hexToCV(event.hex);
      const tx = await fetchTransaction(event.txid);
      return {
        print: cvToValue(cvConvertHiro(cv)),
        txid: event.txid,
        tx,
      };
    })
  );
}
