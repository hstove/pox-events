import { JWT } from "google-auth-library";
import creds from "../google.json";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { NETWORK_KEY } from "./api";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

const jwt = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: SCOPES,
});

export const poxSheet = new GoogleSpreadsheet(
  "1SsPF_-EdcrvnNbKLdW8r46pUa7YIqnJevOKHQU3kKU4",
  jwt
);

export const capitalizedNetwork =
  NETWORK_KEY.charAt(0).toUpperCase() + NETWORK_KEY.slice(1);

export function addressLookupFormula(rowIndex: number) {
  return `=if(istext(XLOOKUP(D${
    rowIndex + 1
  },'${capitalizedNetwork} Addresses'!C$2:C$1000, '${capitalizedNetwork} Addresses'!A$2:A$1000, false)), XLOOKUP(D${
    rowIndex + 1
  },'${capitalizedNetwork} Addresses'!C$2:C$1000, '${capitalizedNetwork} Addresses'!A$2:A$1000, false), "")`;
}

export function stxAmountFormula(rowIndex: number) {
  return `=if(ISBLANK(${rowIndex}), "", ${rowIndex}/1000000)`;
}

export function loadRewardSetSheet(cycle: number) {
  const title = `${capitalizedNetwork} ${cycle}`;
  const sheet = poxSheet.sheetsByTitle[title];
  return sheet;
}
