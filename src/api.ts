import {
  InfoApi,
  Configuration,
  BlocksApi,
  TransactionsApi,
  SmartContractsApi,
  AccountsApi,
  CoreNodePoxResponse,
} from "@stacks/blockchain-api-client";

export const NETWORK_KEY_ENV = "STX_NETWORK";
export const NETWORK_KEY = (process.env[NETWORK_KEY_ENV] ?? "mainnet") as
  | "mainnet"
  | "testnet";
export const apiUrl =
  NETWORK_KEY === "testnet"
    ? "https://api.testnet.hiro.so"
    : "https://api.hiro.so";

export const poxContractId =
  NETWORK_KEY === "testnet"
    ? "ST000000000000000000002AMW42H.pox-4"
    : "SP000000000000000000002Q6VF78.pox-4";

const configuration = new Configuration({
  basePath: apiUrl,
});

export const smartContractsApi = new SmartContractsApi(configuration);
export const transactionsApi = new TransactionsApi(configuration);
export const infoApi = new InfoApi(configuration);

export type PoxInfo = CoreNodePoxResponse & {
  current_cycle: {
    id: number;
  };
  next_cycle: {
    id: number;
    blocks_until_prepare_phase: number;
    blocks_until_reward_phase: number;
  };
};

export async function getPoxInfo() {
  const url = `${apiUrl}/v2/pox`;
  const res = await fetch(url);
  const base = await res.json();
  // const base = await infoApi.getPoxInfo();
  return base as PoxInfo;
}

export type StackerSet = {
  stacker_set: {
    signers: {
      stacked_amt: number;
      weight: number;
      signing_key: string;
    }[];
  };
};

export async function getStackerSet(cycle: number) {
  try {
    const url = `${apiUrl}/v2/stacker_set/${cycle}`;
    console.log(url);
    const res = await fetch(url);
    return (await res.json()) as StackerSet;
  } catch (error) {
    console.error(error);
    return null;
  }
}
