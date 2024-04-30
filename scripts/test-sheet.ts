import { getPoxInfo } from "../src/api";
import {
  addressLookupFormula,
  poxSheet as doc,
  loadRewardSetSheet,
  stxAmountFormula,
} from "../src/gsheets";
import { getRewardCycleAddresses } from "../src/pox";

async function run() {
  await doc.loadInfo();
  console.log(doc.title);

  const sheet = loadRewardSetSheet(85);
  await sheet.loadHeaderRow();
  // console.log(sheet.rowCount);

  // await sheet.loadCells("c2:f1000");
  // await sheet.ro
  // const cell = sheet.getCell(2, 0);
  // console.log(cell.formula);
  // console.log(cell.a1Address);
  // console.log(cell.rowIndex);
  // const nameFormula = addressLookupFormula(cell.rowIndex);
  // const stxFormula = stxAmountFormula(cell.rowIndex);
  // console.log(newFormula);
  // console.log(cell.formula === newFormula);

  const poxInfo = await getPoxInfo();
  // console.log("poxInfo", poxInfo);
  const nextCycle = poxInfo.next_cycle.id;
  console.log(`Next cycle: ${nextCycle}`);
  const addresses = await getRewardCycleAddresses(nextCycle);
  const newRows = addresses.map((addr, i) => {
    const rowIndex = i + 1;
    const nameFormula = addressLookupFormula(rowIndex);
    const stxFormula = stxAmountFormula(rowIndex);
    return [
      nameFormula,
      stxFormula,
      addr.btcAddress,
      addr.signerKey,
      Number(addr.totalUstx),
      addr.stacker || "",
    ];
  });
  await sheet.clearRows({
    start: 1,
  });
  await sheet.addRows(newRows, {
    raw: true,
  });
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
