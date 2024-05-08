import { apiUrl, infoApi } from "../src/api";
import { saveCsv } from "../src/utils";

type Neighbor = {
  ip: string;
  stackerdbs: any[];
};

type Neighbors = {
  outbound: Neighbor[];
  inbound: Neighbor[];
  sample: Neighbor[];
};

async function fetchLatLng(ip: string) {
  const url = `http://ip-api.com/json/${ip}`;
  const res = await fetch(url);
  return (await res.json()) as {
    lat: number;
    lon: number;
    countryCode: string;
    country: string;
    city: string;
  };
}

async function run() {
  const found = new Set<string>();
  const res = await fetch(`${apiUrl}/v2/neighbors`);
  const neighbors = (await res.json()) as Neighbors;
  console.log(Object.keys(neighbors));
  let count = 0;
  const signerNodes: Neighbor[] = [];
  const all = [
    ...neighbors.outbound,
    ...neighbors.inbound,
    ...neighbors.sample,
  ];
  for (const neighbor of all) {
    if (neighbor.stackerdbs.length > 0) {
      if (found.has(neighbor.ip)) {
        continue;
      }
      found.add(neighbor.ip);
      signerNodes.push(neighbor);
      count++;
    }
  }
  const csvData = (
    await Promise.all(
      signerNodes.map(async (node) => {
        const ip = await fetchLatLng(node.ip);
        if (!ip.lat || !ip.lon) {
          return undefined;
        }

        return {
          latitude: ip.lat,
          longitude: ip.lon,
          "Country Code": ip.countryCode,
          Country: ip.country,
          City: ip.city,
          "IP Address": node.ip,
        };
      })
    )
  ).filter((x) => x !== undefined);
  console.log(`Found ${csvData.length} signer nodes`);
  console.log(`Total nodes: ${all.length}`);
  const csv = await saveCsv(csvData, `signer-nodes.csv`);
  console.log(csv);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
