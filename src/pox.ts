import { contracts } from "./clarigen";
import {
  contractFactory,
  ClarigenClient,
  ContractReturnOk,
  ContractReturn,
} from "@clarigen/core";
import { apiUrl, poxContractId } from "./api";
import { sleep } from "./utils";
import { poxAddressToBtcAddress } from "@stacks/stacking";
import { hex } from "@scure/base";

export const pox = contractFactory(contracts.pox4, poxContractId);

export const clarigen = new ClarigenClient(apiUrl);

export async function getRewardCycleAddrLen(cycle: number) {
  return await clarigen.ro(pox.getRewardSetSize(cycle));
}

export type RewardAddressItem = NonNullable<
  ContractReturn<typeof pox.getRewardSetPoxAddress>
>;

export async function getRewardCycleAddresses(cycle: number) {
  const len = await getRewardCycleAddrLen(cycle);
  const addresses: RewardAddressItem[] = [];
  for (let i = 0; i < len; i++) {
    await sleep(1000);
    const item = await clarigen.ro(pox.getRewardSetPoxAddress(cycle, i));
    if (item) addresses.push(item);
  }
  return addresses.map((addr) => {
    const version = addr.poxAddr.version[0];
    const btcAddress = poxAddressToBtcAddress(
      version,
      addr.poxAddr.hashbytes,
      "testnet"
    );
    const signerKey = hex.encode(addr.signer);
    return {
      ...addr,
      btcAddress,
      signerKey,
    };
  });
}

export async function listRewardAddresses(cycle: number) {
  const addresses = await getRewardCycleAddresses(cycle);
  addresses.forEach((addr) => {
    console.log(`BtcAddress: ${addr.btcAddress}, SignerKey: ${addr.signerKey}`);
  });
}
