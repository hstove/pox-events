import { hexToCV } from "@stacks/transactions";
import { cvToValue } from "@clarigen/core";
import { cvConvertMS, cvConvertHiro } from "@clarigen/test";
import { readFile } from "fs/promises";
import { poxAddressToBtcAddress } from "@stacks/stacking";
import { hex } from "@scure/base";
import {
  CachedPrint,
  StackAggregationCommit,
  StackAggregationIncrease,
  StackStx,
  StackedAccount,
  Event,
} from "../src/pox-types";
import { dataFolder, fetchTransaction } from "../src/transactions";
import { Transaction } from "@stacks/stacks-blockchain-api-types";
import { join } from "path";
import { NETWORK_KEY } from "../src/api";
import { loadEvents, saveCsv } from "../src/utils";

async function debug() {
  const events = await loadEvents();
  for (const { print, txid } of events) {
    if (print.name.includes("-increase")) {
      console.log(print);
      break;
    }
  }
}

const runDebug = process.env.DEBUG === "1";

async function run() {
  if (runDebug) {
    return debug();
  }
  const events = await loadEvents();
  console.log(`Total events: ${events.length}`);
  const stackedAccounts: StackedAccount[] = [];
  events.forEach(({ print, txid, tx }) => {
    if (print.name === "stack-stx") {
      const { data, balance, stacker } = print as StackStx;
      const btcAddr = poxAddressToBtcAddress(
        Number(data.poxAddr.version),
        data.poxAddr.hashbytes,
        NETWORK_KEY
      );
      stackedAccounts.push({
        btcAddr,
        signerKey: hex.encode(data.signerKey),
        address: stacker,
        type: "stack-stx",
        amount: data.lockAmount,
        delegator: "",
        txid,
        tx,
      });
    } else if (print.name === "stack-aggregation-increase") {
      const { data } = print as StackAggregationIncrease;
      const btcAddr = poxAddressToBtcAddress(
        Number(data.poxAddr.version),
        data.poxAddr.hashbytes,
        NETWORK_KEY
      );
      stackedAccounts.push({
        btcAddr,
        signerKey: "",
        address: data.delegator,
        type: "stack-aggregation-increase",
        amount: data.amountUstx,
        delegator: print.data.delegator,
        txid,
        tx,
      });
    } else if (
      print.name === "stack-aggregation-commit" ||
      print.name === "stack-aggregation-commit-indexed"
    ) {
      const { data } = print;
      const btcAddr = poxAddressToBtcAddress(
        Number(data.poxAddr.version),
        data.poxAddr.hashbytes,
        NETWORK_KEY
      );
      stackedAccounts.push({
        btcAddr,
        signerKey: hex.encode(data.signerKey),
        address: data.delegator,
        type: "stack-aggregation-commit",
        amount: data.amountUstx,
        delegator: print.data.delegator,
        txid,
        tx,
      });
    }
  });
  console.log(`Stacked accounts: ${stackedAccounts.length}`);
  const csvData = stackedAccounts.map((account) => ({
    Type: account.type,
    Address: account.address,
    Delegator: account.delegator,
    "BTC Address": account.btcAddr,
    "Signer Key": account.signerKey,
    Amount: account.amount.toString(),
    Txid: account.txid,
    Time: new Date(account.tx.burn_block_time_iso)
      .toLocaleString()
      .replaceAll(",", ""),
  }));
  const csv = await saveCsv(csvData, `commit-events.csv`);
  console.log(csv);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
