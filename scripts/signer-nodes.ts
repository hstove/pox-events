import { apiUrl, infoApi } from "../src/api";

type Neighbor = {
  stackerdbs: any[];
};

type Neighbors = {
  outbound: Neighbor[];
};

async function run() {
  const res = await fetch(`${apiUrl}/v2/neighbors`);
  const neighbors = (await res.json()) as Neighbors;
  let count = 0;
  for (const neighbor of neighbors.outbound) {
    if (neighbor.stackerdbs.length > 0) {
      count++;
    }
  }
  console.log(`Found ${count} signer nodes`);
  console.log(`Total nodes: ${neighbors.outbound.length}`);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
