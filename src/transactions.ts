import { NETWORK_KEY, transactionsApi } from "./api";
import { join } from "path";
import { Transaction } from "@stacks/stacks-blockchain-api-types";
import { readFile, writeFile, mkdir, stat } from "fs/promises";

export function transactionPath(txid: string) {
  return join(transactionsFolder(), `${txid}.json`);
}

export async function fileExists(filename: string): Promise<boolean> {
  try {
    await stat(filename);
    return true;
  } catch (error) {
    return false;
  }
}

export function dataFolder() {
  return join("data", NETWORK_KEY);
}

export function transactionsFolder() {
  return join(dataFolder(), "transactions");
}

export async function getTransactionFile(
  txid: string
): Promise<Transaction | undefined> {
  // await mkdir(join("data", "transactions"), { recursive: true });
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
}

// Given a list of txids, chunk them in groups of 50 and fetch using
// `transactionsApi.getTxListDetails`
export async function saveTransactions(txids: string[]) {
  const limit = 50;
  const chunks = [];
  const missingTxids: string[] = [];
  await Promise.all(
    txids.map(async (txid) => {
      const exists = await fileExists(transactionPath(txid));
      if (!exists) {
        missingTxids.push(txid);
      }
    })
  );
  console.log(`Fetching ${missingTxids.length} transactions`);
  for (let i = 0; i < missingTxids.length; i += limit) {
    chunks.push(missingTxids.slice(i, i + limit));
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
  await mkdir(transactionsFolder(), { recursive: true });
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
