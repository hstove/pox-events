export type StackAggregationCommit = {
  name: 'stack-aggregation-commit-indexed' | 'stack-aggregation-commit';
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
  name: 'stack-stx';
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

export type CachedPrint = {
  txid: string;
  hex: string;
}