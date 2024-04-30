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

export type StackAggregationIncrease = {
  name: "stack-aggregation-increase";
  data: {
    amountUstx: bigint;
    delegator: string;
    poxAddr: {
      version: bigint;
      hashbytes: Uint8Array;
    };
  };
};

export type DelegateStx = {
  balance: bigint;
  burnchainUnlockHeight: bigint;
  data: {
    amountUstx: bigint;
    poxAddr: {
      version: bigint;
      hashbytes: Uint8Array;
    } | null;
    delegateTo: string;
    startCycleId: bigint;
  };
  name: "delegate-stx";
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
  print:
    | StackStx
    | StackAggregationCommit
    | StackAggregationIncrease
    | DelegateStx;
  tx: Transaction;
};

export type CachedPrint = {
  txid: string;
  hex: string;
};
