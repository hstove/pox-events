import { hexToCV } from "@stacks/transactions";
import { cvToValue } from "@clarigen/core";
import { cvConvertMS, cvConvertHiro } from "@clarigen/test";
import { readFile } from "fs/promises";
import { poxAddressToBtcAddress } from "@stacks/stacking";
import { hex } from "@scure/base";
// import { CachedPrint } from "../src/pox-types";
import { dataFolder, fetchTransaction } from "../src/transactions";
import { Transaction } from "@stacks/stacks-blockchain-api-types";
import { join } from "path";
import { NETWORK_KEY } from "../src/api";
import { loadEvents, saveCsv } from "../src/utils";
import { DelegateStx } from "../src/pox-types";

async function debug() {
  const events = await loadEvents();
  for (const { print, txid } of events) {
    if (print.name === "delegate-stx") {
      console.log(print);
      break;
    }
  }
}

function min(a: bigint, b: bigint) {
  return a < b ? a : b;
}

type Delegates = {
  "Delegate To": string;
  Stacker: string;
  Amount: string;
  Txid: string;
  Date: string;
};

async function run() {
  const events = await loadEvents();
  const csvData: Delegates[] = [];
  for (const { print, txid, tx } of events) {
    if (print.name === "delegate-stx") {
      csvData.push({
        "Delegate To": print.data.delegateTo,
        Stacker: print.stacker,
        Amount: min(print.data.amountUstx, print.balance).toString(),
        Txid: txid,
        Date: new Date(tx.burn_block_time_iso)
          .toLocaleString()
          .replaceAll(",", ""),
      });
    }
  }
  const csv = await saveCsv(csvData, `delegations.csv`);
  console.log(csv);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
