import { hexToCV, getAddressFromPublicKey } from "@stacks/transactions";
import { cvToValue } from "@clarigen/core";
import { cvConvertMS, cvConvertHiro } from "@clarigen/test";
import { readFile } from "fs/promises";
import { poxAddressToBtcAddress } from "@stacks/stacking";
import { hex } from "@scure/base";
import { CachedPrint } from "../src/pox-types";
import { fetchTransaction } from "../src/transactions";
import { Transaction } from "@stacks/stacks-blockchain-api-types";

export type StackAggregationCommit = {
  name: "stack-aggregation-commit-indexed" | "stack-aggregation-commit";
  balance: bigint;
  data: {
    signerKey: Uint8Array;
    delegator: string;
    amountUstx: bigint;
    poxAddr: {
      version: bigint;
      hashbytes: Uint8Array;
    };
  };
};

export type StackStx = {
  name: "stack-stx";
  data: {
    signerKey: Uint8Array;
    lockAmount: bigint;
    poxAddr: {
      version: bigint;
      hashbytes: Uint8Array;
    };
  };
  balance: bigint;
  stacker: string;
};

export type StackedAccount = {
  btcAddr: string;
  signerKey: string;
  address: string;
  type: string;
  amount: bigint;
  delegator: string;
  txid: string;
  tx: Transaction;
};

export type Event = {
  txid: string;
  print: StackStx | StackAggregationCommit;
  tx: Transaction;
};

// export type

async function loadEvents(): Promise<Event[]> {
  const path = "./data/pox-events.json";
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

async function run() {
  const events = await loadEvents();
  console.log(`Total events: ${events.length}`);
  // console.log(events);
  // console.log(events.slice(0, 50));
  const stackedAccounts: StackedAccount[] = [];
  // for (let { print, txid } of events.slice(0, 1)) {
  //   const tx = await fetchTransaction(txid);
  //   console.log(tx);
  // }
  events.slice(1).forEach(({ print, txid, tx }) => {
    if (print.name === "stack-stx") {
      const { data, balance, stacker } = print as StackStx;
      const btcAddr = poxAddressToBtcAddress(
        Number(data.poxAddr.version),
        data.poxAddr.hashbytes,
        "testnet"
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
    } else if (print.name.startsWith("stack-aggregation-commit")) {
      const { data } = print;
      const btcAddr = poxAddressToBtcAddress(
        Number(data.poxAddr.version),
        data.poxAddr.hashbytes,
        "testnet"
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
  stackedAccounts.forEach((account) => {
    console.log(
      [
        account.type,
        account.address,
        account.delegator,
        account.btcAddr,
        account.signerKey,
        account.amount.toString(),
        account.txid,
        account.tx.burn_block_time_iso,
      ].join(",")
    );
  });
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
