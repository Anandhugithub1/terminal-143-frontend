/* ========== Step2Bio.jsx ========== */
import React from "react";
import { useWizard } from "../../contexts/ProfileWizard";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./Progess";
import ReactCountryFlag from "react-country-flag";
import { Listbox } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";

const STD_STATUS = {
  POSITIVE: "p",
  NEGATIVE: "n",
  PREFER_NOT_TO_SAY: "pns",
};
const LANGUAGES = {
  ENGLISH: "en",
  THAI: "th",
  RUSSIAN: "ru",
  CHINESE: "zh",
  SPANISH: "es",
  MEXICAN: "mx",
  ITALIAN: "it",
  PORTUGUESE: "pt",
  FRENCH: "fr",
  GERMAN: "de",
  JAPANESE: "ja",
  KOREAN: "ko",
  ARABIC: "ar",
  VIETNAMESE: "vi",
  TURKISH: "tr",
  TAMIL: "ta",
  DUTCH: "nl",
  GREEK: "el",
  POLISH: "pl",
  SWEDISH: "sv",
  HEBREW: "he",
  INDONESIAN: "id",
  FILIPINO: "fil",
  MALAY: "ms",
  UKRAINIAN: "uk",
  CZECH: "cs",
  ROMANIAN: "ro",
  HUNGARIAN: "hu",
  DANISH: "da",
  NORWEGIAN: "no",
  FINNISH: "fi",
};

const languageOptions = [
  { label: "English", value: LANGUAGES.ENGLISH, countryCode: "GB" },
  { label: "Spanish", value: LANGUAGES.SPANISH, countryCode: "ES" },
  { label: "French", value: LANGUAGES.FRENCH, countryCode: "FR" },
  { label: "German", value: LANGUAGES.GERMAN, countryCode: "DE" },
  { label: "Mandarin", value: LANGUAGES.CHINESE, countryCode: "CN" },
  { label: "Thai", value: LANGUAGES.THAI, countryCode: "TH" },
  { label: "Russian", value: LANGUAGES.RUSSIAN, countryCode: "RU" },
  { label: "Mexican", value: LANGUAGES.MEXICAN, countryCode: "MX" },
  { label: "Italian", value: LANGUAGES.ITALIAN, countryCode: "IT" },
  { label: "Portuguese", value: LANGUAGES.PORTUGUESE, countryCode: "PT" },
  { label: "Japanese", value: LANGUAGES.JAPANESE, countryCode: "JP" },
  { label: "Korean", value: LANGUAGES.KOREAN, countryCode: "KR" },
  { label: "Arabic", value: LANGUAGES.ARABIC, countryCode: "SA" },
  { label: "Vietnamese", value: LANGUAGES.VIETNAMESE, countryCode: "VN" },
  { label: "Turkish", value: LANGUAGES.TURKISH, countryCode: "TR" },
  { label: "Tamil", value: LANGUAGES.TAMIL, countryCode: "IN" },
  { label: "Dutch", value: LANGUAGES.DUTCH, countryCode: "NL" },
  { label: "Greek", value: LANGUAGES.GREEK, countryCode: "GR" },
  { label: "Polish", value: LANGUAGES.POLISH, countryCode: "PL" },
  { label: "Swedish", value: LANGUAGES.SWEDISH, countryCode: "SE" },
  { label: "Hebrew", value: LANGUAGES.HEBREW, countryCode: "IL" },
  { label: "Indonesian", value: LANGUAGES.INDONESIAN, countryCode: "ID" },
  { label: "Filipino", value: LANGUAGES.FILIPINO, countryCode: "PH" },
  { label: "Malay", value: LANGUAGES.MALAY, countryCode: "MY" },
  { label: "Ukrainian", value: LANGUAGES.UKRAINIAN, countryCode: "UA" },
  { label: "Czech", value: LANGUAGES.CZECH, countryCode: "CZ" },
  { label: "Romanian", value: LANGUAGES.ROMANIAN, countryCode: "RO" },
  { label: "Hungarian", value: LANGUAGES.HUNGARIAN, countryCode: "HU" },
  { label: "Danish", value: LANGUAGES.DANISH, countryCode: "DK" },
  { label: "Norwegian", value: LANGUAGES.NORWEGIAN, countryCode: "NO" },
  { label: "Finnish", value: LANGUAGES.FINNISH, countryCode: "FI" },
];
const statusOptions = [
  { label: "Positive", value: STD_STATUS.POSITIVE },
  { label: "Negative", value: STD_STATUS.NEGATIVE },
  { label: "Prefer not to say", value: STD_STATUS.PREFER_NOT_TO_SAY },
];

const socialMediaPlatformOptions = [
  "IG",
  "FB",
  "Telegram",
  "Line",
  "Wechat",
  "Other",
];

const Step2Bio = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const charLimit = 500;

  const healthStatus = formData.healthStatus || {
    stdStatus: "",
    lastTestedDate: "",
  };
  const socialMediaLinks = formData.socialMediaLinks || [];

  const handleNext = () => navigate("/complete/photo");
  const handleBack = () => navigate("/complete/basic");

  const handleLanguagesChange = (selected) => {
    setFormData({ ...formData, languagesKnown: selected });
  };

  const handleStatusChange = (e) => {
    setFormData({
      ...formData,
      healthStatus: {
        ...healthStatus,
        stdStatus: e.target.value,
      },
    });
  };

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      healthStatus: {
        ...healthStatus,
        lastTestedDate: e.target.value,
      },
    });
  };

  const handleSocialMediaChange = (index, field, value) => {
    const updatedLinks = [...socialMediaLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value,
    };
    setFormData({ ...formData, socialMediaLinks: updatedLinks });
  };

  const handleAddSocialMedia = () => {
    const updatedLinks = [
      ...socialMediaLinks,
      { platform: "", usernameOrLink: "" },
    ];
    setFormData({ ...formData, socialMediaLinks: updatedLinks });
  };

  const handleRemoveSocialMedia = (index) => {
    const updatedLinks = socialMediaLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, socialMediaLinks: updatedLinks });
  };

  return (
    <div className="animate-fade-in">
      <ProgressBar step={2} totalSteps={4} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Story 💬</h2>
        <p className="text-gray-500">What makes you unique?</p>
      </div>

      {/* Bio Field */}
      <div className="relative mb-8">
        <textarea
          value={formData.bio || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              bio: e.target.value.slice(0, charLimit),
            })
          }
          placeholder="I'm passionate about..."
          className="w-full p-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500 resize-none min-h-[160px]"
        />
        <div className="absolute bottom-3 right-3 text-sm text-gray-400">
          {formData.bio?.length || 0}/{charLimit}
        </div>
      </div>

      {/* Languages Known */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Languages You Know 🌐</h3>
        <Listbox
          value={formData.languagesKnown || []}
          onChange={handleLanguagesChange}
          multiple
        >
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-xl bg-gray-50 py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 sm:text-sm">
              <span className="block truncate">
                {formData.languagesKnown?.length > 0
                  ? languageOptions
                      .filter((opt) =>
                        formData.languagesKnown.includes(opt.value)
                      )
                      .map((opt) => opt.label)
                      .join(", ")
                  : "Select languages"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {languageOptions.map(({ label, value, countryCode }) => (
                <Listbox.Option
                  key={value}
                  value={value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-pink-100 text-pink-900" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate flex items-center gap-2 ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        <ReactCountryFlag
                          countryCode={countryCode}
                          svg
                          style={{
                            width: "1.5em",
                            height: "1.5em",
                            borderRadius: "50%",
                          }}
                          title={countryCode}
                        />
                        {label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* STD Status */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">STD Status 🧬</h3>
        <select
          value={healthStatus.stdStatus}
          onChange={handleStatusChange}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300"
        >
          <option value="" disabled>
            Select your STD status
          </option>
          {statusOptions.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Last Tested Date */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Last Tested Date 🗓️</h3>
        <input
          type="date"
          value={healthStatus.lastTestedDate}
          onChange={handleDateChange}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300"
        />
      </div>

      {/* Social Media Links */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Social Media Links 🔗</h3>
        {socialMediaLinks.map((link, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row gap-2 mb-3 sm:items-center"
          >
            <select
              value={link.platform}
              onChange={(e) =>
                handleSocialMediaChange(index, "platform", e.target.value)
              }
              className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-300"
            >
              <option value="" disabled>
                Select platform
              </option>
              {socialMediaPlatformOptions.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Username or HTTPS Link"
              value={link.usernameOrLink}
              onChange={(e) =>
                handleSocialMediaChange(index, "usernameOrLink", e.target.value)
              }
              className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-300"
            />
            <button
              type="button"
              onClick={() => handleRemoveSocialMedia(index)}
              className="p-2 text-red-500 hover:text-red-700"
              title="Remove"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddSocialMedia}
          className="mt-2 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600"
        >
          + Add Social Media
        </button>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2Bio;
