import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxButton,
} from "@headlessui/react";
import ReactCountryFlag from "react-country-flag";
import { ChevronDown, Search } from "lucide-react";
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
      onClose={() => setQuery("")}
    >
      {({ open }) => (
        <div className="relative shrink-0">
          <ComboboxButton className="flex items-center gap-1 h-11 sm:h-12 px-3 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
            <ReactCountryFlag
              svg
              countryCode={selected.countryCode}
              style={{ width: "1.1em", height: "1.1em" }}
            />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              +{selected.callingCode}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </ComboboxButton>

          <ComboboxOptions
            anchor="bottom start"
            className="z-50 mt-1 w-72 max-w-[calc(100vw-2rem)] max-h-80 overflow-hidden flex flex-col bg-white rounded-xl shadow-lg border border-gray-200"
          >
            {open && (
              <div className="relative shrink-0 p-2 border-b border-gray-100">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <ComboboxInput
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  onChange={(e) => setQuery(e.target.value)}
                  displayValue={() => query}
                  placeholder="Search country or code"
                  aria-label="Search country"
                />
              </div>
            )}

            <div className="overflow-y-auto">
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
            </div>
          </ComboboxOptions>
        </div>
      )}
    </Combobox>
  );
}
