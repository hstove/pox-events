import { getPoxInfo, infoApi } from "../src/api";
import { getRewardCycleAddresses, listRewardAddresses } from "../src/pox";

async function run() {
  const poxInfo = await getPoxInfo();
  // console.log("poxInfo", poxInfo);
  const nextCycle = poxInfo.next_cycle.id;
  console.log(`Next cycle: ${nextCycle}`);
  const addresses = await getRewardCycleAddresses(nextCycle);
  console.log(["Btc Address", "Signer Key", "Total", "Solo Stacker"].join(","));
  addresses.forEach((addr) => {
    console.log(
      [
        addr.btcAddress,
        addr.signerKey,
        addr.totalUstx,
        addr.stacker || "",
      ].join(",")
    );
  });
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
