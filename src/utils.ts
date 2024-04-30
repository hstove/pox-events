import { join } from "path";
import { dataFolder, fetchTransaction } from "./transactions";
import { readFile, writeFile } from "fs/promises";
import { Event, CachedPrint } from "./pox-types";
import { hexToCV } from "@stacks/transactions";
import { cvToValue } from "@clarigen/core";
import { cvConvertMS, cvConvertHiro } from "@clarigen/test";
import { stringify } from "csv-stringify";

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

export async function stringifyCsv(
  data: Record<string, string | number>[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify(data, { header: true }, (err, output) => {
      return err ? reject(err) : resolve(output);
    });
  });
}

export async function saveCsv(
  data: Record<string, string | number>[],
  filename: string
) {
  const csv = await stringifyCsv(data);
  await writeFile(join(dataFolder(), filename), csv, "utf-8");
  return csv;
}

export function dateToString(dateIso: string) {
  return new Date(dateIso)
    .toLocaleString("en-US", { timeZone: "America/New_York" })
    .replaceAll(",", "");
}
