import { smartContractsApi } from '../src/api';
import {
  TransactionEvent,
  TransactionEventSmartContractLog,
} from '@stacks/stacks-blockchain-api-types';
import { writeFile } from 'fs/promises';
import { CachedPrint } from './pox-types';

export const limit = 50;

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPoxEvents(offset?: number) {
  const response = (await smartContractsApi.getContractEventsById({
    contractId: 'ST000000000000000000002AMW42H.pox-4',
    limit,
    offset,
  })) as {
    results: TransactionEvent[];
    total: number;
  };
  const { results, ...rest } = response;
  // console.log(rest);
  // console.log(`Total: ${response.total}, Offset: ${offset}`);
  return response;
}

async function run() {
  const eventsHex: CachedPrint[] = [];
  let offset = 0;
  let lastEventsLength = 1;
  while (lastEventsLength > 0) {
    const events = await fetchPoxEvents(offset);
    lastEventsLength = events.results.length;
    offset += limit;
    events.results.forEach((event: TransactionEvent) => {
      if (event.event_type !== 'smart_contract_log') return;
      const hex = event.contract_log.value.hex;
      eventsHex.push({
        hex,
        
      });
    });
    console.log(`Offset: ${offset}, Total: ${eventsHex.length}`);
    await sleep(1000);
  }
  await writeFile('pox-events.json', JSON.stringify(eventsHex));
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
