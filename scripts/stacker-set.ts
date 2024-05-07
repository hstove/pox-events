import { getPoxInfo, getStackerSet, infoApi } from "../src/api";
import { getRewardCycleAddresses, listRewardAddresses } from "../src/pox";
import { stringify } from "csv-stringify";
import { saveCsv } from "../src/utils";
import {
  AddressHashMode,
  AddressVersion,
  addressFromPublicKeys,
  createStacksPublicKey,
  addressToString,
} from "@stacks/transactions";

async function run() {
  const poxInfo = await getPoxInfo();
  // console.log("poxInfo", poxInfo);
  const nextCycle = poxInfo.next_cycle.id;
  console.log(`Next cycle: ${nextCycle}\n`);
  const stackerSet = await getStackerSet(nextCycle);
  if (!stackerSet || "err_msg" in stackerSet) {
    console.log(`No stacker set for cycle ${nextCycle}`);
    return;
  }
  const { signers } = stackerSet.stacker_set;
  const csvData = signers.map((addr) => {
    const stxAddr = addressFromPublicKeys(
      AddressVersion.MainnetSingleSig,
      AddressHashMode.SerializeP2PKH,
      1,
      [createStacksPublicKey(addr.signing_key)]
    );
    return {
      "Public Key": addr.signing_key,
      "Stacks Address": addressToString(stxAddr),
      "Stacked Amount": addr.stacked_amt,
      Weight: addr.weight,
    };
  });
  const csv = await saveCsv(csvData, `stacker-set-${nextCycle}.csv`);
  console.log(csv);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
