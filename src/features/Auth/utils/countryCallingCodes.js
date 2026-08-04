import { customList } from "country-codes-list";

// { AD: "Andorra|376", TH: "Thailand|66", ... } for all ~250 ISO countries —
// full global coverage (the app's region gate limits who can sign up, not
// which country code a phone number can use to register in the first place).
const raw = customList(
  "countryCode",
  "{countryNameEn}|{countryCallingCode}"
);

export const COUNTRY_CALLING_CODES = Object.entries(raw)
  .map(([countryCode, value]) => {
    const [name, callingCode] = value.split("|");
    return { countryCode, name, callingCode };
  })
  .filter((c) => c.callingCode)
  .sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_COUNTRY_CODE = "TH";

export function findCountryByCode(countryCode) {
  return COUNTRY_CALLING_CODES.find((c) => c.countryCode === countryCode);
}
