import { getPoxInfo, infoApi } from "../src/api";
import { getRewardCycleAddresses, listRewardAddresses } from "../src/pox";
import { stringify } from "csv-stringify";
import { saveCsv } from "../src/utils";

async function run() {
  const poxInfo = await getPoxInfo();
  // console.log("poxInfo", poxInfo);
  const nextCycle = poxInfo.next_cycle.id;
  console.log(`Next cycle: ${nextCycle}\n\n`);
  const addresses = await getRewardCycleAddresses(nextCycle);
  const csvData = addresses.map((addr) => ({
    "BTC Address": addr.btcAddress,
    "Signer Key": addr.signerKey,
    "Total uSTX": addr.totalUstx.toString(),
    Stacker: addr.stacker || "",
  }));
  const csv = await saveCsv(csvData, `reward-set-${nextCycle}.csv`);
  console.log(csv);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
