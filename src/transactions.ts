import { transactionsApi } from "./api";
import { join } from "path";
import { Transaction } from "@stacks/stacks-blockchain-api-types";
import { readFile, writeFile, mkdir } from "fs/promises";

export function transactionPath(txid: string) {
  return join("data", "transactions", `${txid}.json`);
}

export async function getTransactionFile(
  txid: string
): Promise<Transaction | undefined> {
  await mkdir(join("data", "transactions"), { recursive: true });
  const path = transactionPath(txid);
  try {
    const text = await readFile(path, "utf-8");
    return JSON.parse(text);
  } catch (error) {
    return undefined;
  }
}

export async function fetchTransaction(txid: string): Promise<Transaction> {
  const fileData = await getTransactionFile(txid);
  return fileData as Transaction;
  // if (fileData) return fileData;
  // const tx = await transactionsApi.getTransactionById({ txId: txid });
  // // await transactionsApi.getTxListDetailsRaw
  // console.log(tx);
  // if (tx) {
  //   await writeFile(
  //     transactionPath(txid),
  //     JSON.stringify(tx, null, 2),
  //     "utf-8"
  //   );
  // }
  // return tx;
}

// Given a list of txids, chunk them in groups of 50 and fetch using
// `transactionsApi.getTxListDetails`
export async function saveTransactions(txids: string[]) {
  const limit = 50;
  const chunks = [];
  for (let i = 0; i < txids.length; i += limit) {
    chunks.push(txids.slice(i, i + limit));
  }
  const results: Transaction[] = [];
  for (const chunk of chunks) {
    const txs = (await transactionsApi.getTxListDetails({ txId: chunk })) as {
      [txid: string]: {
        result: Transaction;
      };
    };
    for (const [txid, tx] of Object.entries(txs)) {
      results.push(tx.result);
    }
  }
  await Promise.all(
    results.map(async (tx) => {
      await writeFile(
        transactionPath(tx.tx_id),
        JSON.stringify(tx, null, 2),
        "utf-8"
      );
    })
  );
  return results;
}
