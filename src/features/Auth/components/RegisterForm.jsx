import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InputField } from "../../../shared/common";
import PasswordInput from "../../../shared/Passinput";
import { Button } from "../../../shared/Button";
import { ChevronDown } from "lucide-react";
import { useRegister } from "../useAuth";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";
import { toast } from "sonner"
import ReactCountryFlag from "react-country-flag";
import CountryCodeSelect from "./CountryCodeSelect";
import { DEFAULT_COUNTRY_CODE, findCountryByCode } from "../utils/countryCallingCodes";

// A single "email or phone" field has to guess which one the user means as
// they type. Digits-first (optionally with a leading +) reads as a phone
// number in progress; anything else (starts with a letter, or already has
// an @) is treated as an email — matching how the backend itself
// disambiguates the combined field (see authApi.js's `.includes('@')`).
function looksLikePhone(value) {
  return /^\+?[0-9\s-]*$/.test(value) && value.trim() !== "";
}

const RegisterForm = () => {
  const { t, ready } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");

  const [emailPhone, setEmailPhone] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();

  const { mutate, isPending, isError, isSuccess, data, error } = useRegister();

  const isPhoneInput = looksLikePhone(emailPhone);
  const callingCode = useMemo(
    () => findCountryByCode(countryCode)?.callingCode,
    [countryCode]
  );
  // What actually gets submitted/shown post-registration: the country's
  // dial code combined with the digits the user typed, so they never have
  // to type "+66" themselves. A user who pastes a full international number
  // (already starting with +) is trusted as-is rather than double-prefixed;
  // anything else (email) passes through unchanged.
  const submittedValue = !isPhoneInput
    ? emailPhone
    : emailPhone.trim().startsWith("+")
      ? emailPhone.replace(/[\s-]/g, "")
      : `+${callingCode}${emailPhone.replace(/[\s-]/g, "").replace(/^0+/, "")}`;

useEffect(() => {
  if (isSuccess) {
    toast.success(t("registrationSuccessful"))

    navigate(
      `/verify?email=${encodeURIComponent(submittedValue)}`
    )
  }
}, [isSuccess, navigate, submittedValue, t])


  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setLocalError(t("passwordMismatch"));
      return;
    }

    if (!gender) {
      setLocalError(t("selectGender"));
      return;
    }

    if (!agreedToTerms) {
      setLocalError(t("mustAgreeToTerms"));
      return;
    }

    setLocalError("");
    mutate({ emailPhone: submittedValue, password, gender, agreedToTerms });
  };

  if (!ready) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        {isPhoneInput && (
          <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
        )}
        <InputField
          value={emailPhone}
          onChange={(e) => setEmailPhone(e.target.value)}
          placeholder={t("emailOrPhone")}
          className="flex-1 min-w-0"
        />
      </div>

      <div className="text-xs text-gray-500">
        {isPhoneInput
          ? t("phoneCountryHint", "We'll add the country code automatically — just enter your number.")
          : t("emailOrPhoneHint", "Enter your email, or start typing your phone number to pick a country code.")}
      </div>

<div className="relative">
  <select
    id="gender"
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="peer w-full border border-gray-300 rounded-lg px-4 pt-5 pb-2
               focus:outline-none focus:ring-2 focus:ring-pink-500
               focus:border-transparent transition-all appearance-none
               pr-10 bg-white hover:border-gray-400"
  >
    <option value="" disabled hidden></option>
    <option value="MALE">{t("male")}</option>
    <option value="FEMALE">{t("female")}</option>
    <option value="TO_FEMALE">{t("transFemale")}</option>
    <option value="TO_MALE">{t("transMale")}</option>
    <option value="OTHERS">{t("other")}</option>
  </select>

  <label
    htmlFor="gender"
    className={`absolute left-4 transition-all duration-200
      ${gender
        ? "top-2 text-xs text-pink-500"
        : "top-3 text-sm text-gray-400"}
    `}
  >
    {t("gender")}
  </label>

  <ChevronDown
    className="absolute right-3 top-1/2 -translate-y-1/2
               text-gray-500 pointer-events-none"
    size={20}
  />
</div>



      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("createPassword")}
      />

      <div className="text-xs text-gray-500">{t("passwordRequirements")}</div>

      <PasswordInput
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t("confirmPassword")}
      />

      <div className="flex items-start gap-2">
        <input
          id="agreedToTerms"
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
        />
        <label htmlFor="agreedToTerms" className="text-sm text-gray-600">
          {t("agreeToTermsPrefix")}{" "}
          <Link to="/terms" className="text-pink-600 font-semibold hover:underline">
            {t("termsOfService")}
          </Link>{" "}
          {t("agreeToTermsConjunction")}{" "}
          <Link to="/privacy" className="text-pink-600 font-semibold hover:underline">
            {t("privacyPolicy")}
          </Link>
        </label>
      </div>

      {(localError || isError) && (
        <p className="text-red-500 text-sm">
          {localError || getErrorMessage(error)}
        </p>
      )}

      {isSuccess && <p className="text-green-600 text-sm">{data?.message}</p>}

      <Button type="submit" disabled={isPending || !agreedToTerms}>
        {isPending ? t("registering") : t("getStarted")}
      </Button>
<div className="mt-4 text-center text-sm text-gray-500">
  <p className="font-medium">
    {tCommon("regionGate.availableIn")}
  </p>

  <div className="mt-2 flex justify-center items-center gap-3">
    <ReactCountryFlag svg countryCode="TH" title="Thailand" style={{ width: "1.6em", height: "1.6em" }} />
    <ReactCountryFlag svg countryCode="PH" title="Philippines" style={{ width: "1.6em", height: "1.6em" }} />
    <ReactCountryFlag svg countryCode="ID" title="Indonesia" style={{ width: "1.6em", height: "1.6em" }} />
    <ReactCountryFlag svg countryCode="KH" title="Cambodia" style={{ width: "1.6em", height: "1.6em" }} />
    <ReactCountryFlag svg countryCode="VN" title="Vietnam" style={{ width: "1.6em", height: "1.6em" }} />
    <ReactCountryFlag svg countryCode="MY" title="Malaysia" style={{ width: "1.6em", height: "1.6em" }} />
  </div>

  <p className="mt-2 text-xs text-gray-400">
    {tCommon("regionGate.availableInDetail")}
  </p>
</div>




      <div className="mt-6 text-center text-sm text-gray-500">
        {t("alreadyHaveAccount")}{" "}
        <Link
          to="/login"
          className="text-pink-600 font-semibold hover:underline"
        >
          {t("signIn")}
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
