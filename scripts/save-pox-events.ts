import { NETWORK_KEY, poxContractId, smartContractsApi } from "../src/api";
import {
  TransactionEvent,
  TransactionEventSmartContractLog,
} from "@stacks/stacks-blockchain-api-types";
import { mkdir, writeFile } from "fs/promises";
import { CachedPrint } from "../src/pox-types";
import { fetchTransaction, saveTransactions } from "../src/transactions";
import { join } from "path";
import { sleep } from "../src/utils";

export const limit = 50;

export async function fetchPoxEvents(offset?: number) {
  const response = (await smartContractsApi.getContractEventsById({
    contractId: poxContractId,
    limit,
    offset,
  })) as {
    results: TransactionEvent[];
    total: number;
  };
  const { results, ...rest } = response;
  return response;
}

async function run() {
  const eventsHex: CachedPrint[] = [];
  let offset = 0;
  let lastEventsLength = 1;
  let foundOne = false;
  while (lastEventsLength > 0 && !foundOne) {
    const events = await fetchPoxEvents(offset);
    lastEventsLength = events.results.length;
    offset += limit;
    events.results.forEach((event: TransactionEvent) => {
      if (event.event_type !== "smart_contract_log") return;
      const hex = event.contract_log.value.hex;
      eventsHex.push({
        hex,
        txid: event.tx_id,
      });
    });
    if (eventsHex.length > 0) {
      const lastEvent = eventsHex.at(-1);
      if (lastEvent) {
        const tx = await fetchTransaction(lastEvent.txid);
        if (typeof tx !== "undefined") {
          foundOne = true;
          console.log(`Found existing tx: ${lastEvent.txid}`);
        }
      }
    }
    console.log(`Offset: ${offset}, Total: ${eventsHex.length}`);
    await sleep(1000);
  }
  const dataDir = join("data", NETWORK_KEY);
  await mkdir(dataDir, { recursive: true });
  await writeFile(join(dataDir, "pox-events.json"), JSON.stringify(eventsHex));
  await saveTransactions(eventsHex.map((event) => event.txid));
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
