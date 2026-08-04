import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxButton,
} from "@headlessui/react";
import ReactCountryFlag from "react-country-flag";
import { ChevronDown } from "lucide-react";
import { COUNTRY_CALLING_CODES, findCountryByCode } from "../utils/countryCallingCodes";

export default function CountryCodeSelect({ value, onChange }) {
  const [query, setQuery] = useState("");
  const selected = findCountryByCode(value) || COUNTRY_CALLING_CODES[0];

  const filtered =
    query === ""
      ? COUNTRY_CALLING_CODES
      : COUNTRY_CALLING_CODES.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.callingCode.includes(query)
        );

  return (
    <Combobox
      value={selected.countryCode}
      onChange={(countryCode) => {
        if (countryCode) onChange(countryCode);
      }}
    >
      <div className="relative shrink-0">
        <ComboboxButton className="flex items-center gap-1.5 h-full pl-3 pr-2 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
          <ReactCountryFlag
            svg
            countryCode={selected.countryCode}
            style={{ width: "1.1em", height: "1.1em" }}
          />
          <span className="text-sm font-medium text-gray-700">
            +{selected.callingCode}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </ComboboxButton>

        <ComboboxInput
          className="sr-only"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={() => ""}
          aria-label="Search country"
        />

        <ComboboxOptions className="absolute z-50 mt-1 w-64 max-h-72 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">No countries found</div>
          ) : (
            filtered.map((c) => (
              <ComboboxOption
                key={c.countryCode}
                value={c.countryCode}
                className={({ active }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 cursor-pointer text-sm ${
                    active ? "bg-pink-50" : ""
                  }`
                }
              >
                <ReactCountryFlag
                  svg
                  countryCode={c.countryCode}
                  style={{ width: "1.1em", height: "1.1em" }}
                />
                <span className="flex-1 truncate text-gray-800">{c.name}</span>
                <span className="text-gray-400">+{c.callingCode}</span>
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
