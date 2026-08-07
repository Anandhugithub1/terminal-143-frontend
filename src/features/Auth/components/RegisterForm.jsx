import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InputField } from "../../../shared/common";
import PasswordInput from "../../../shared/Passinput";
import { Button } from "../../../shared/Button";
import { ChevronDown } from "lucide-react";
import { useRegister } from "../useAuth";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";
import { toast } from "sonner"
import ReactCountryFlag from "react-country-flag";
import PhoneNumberInput from "./PhoneNumberInput";

// Deliberately simple format check (not RFC 5322) — just enough to catch
// obvious typos like a missing "@" or domain before hitting the backend.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterForm = () => {
  const { t, ready } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");

  // Explicit tabs rather than one field guessing which the user means —
  // PhoneInput (react-phone-number-input) owns the phone case entirely
  // (country select, formatting, E.164 output), so it can't share a raw
  // text field with an email value the way a hand-rolled picker could.
  const [mode, setMode] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // E.164, e.g. "+66812345678"
  // null = empty field (not yet judged invalid), true/false = intl-tel-input's
  // isValidNumber() result for the current country + digits.
  const [phoneValid, setPhoneValid] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();

  const { mutate, isPending, isError, isSuccess, data, error } = useRegister();

  const emailPhone = mode === "email" ? email.trim() : (phone || "").trim();

useEffect(() => {
  if (isSuccess) {
    toast.success(t("registrationSuccessful"))

    navigate(
      `/verify?email=${encodeURIComponent(emailPhone)}`
    )
  }
}, [isSuccess, navigate, emailPhone, t])


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailPhone) {
      setLocalError(mode === "email" ? t("emailRequired", "Please enter your email.") : t("phoneRequired", "Please enter your phone number."));
      return;
    }

    if (mode === "email" && !EMAIL_PATTERN.test(emailPhone)) {
      setLocalError(t("emailInvalid", "Please enter a valid email address."));
      return;
    }

    if (mode === "phone" && phoneValid === false) {
      setLocalError(t("phoneInvalid", "Please enter a valid phone number."));
      return;
    }

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
    mutate({ emailPhone, password, gender, agreedToTerms });
  };

  if (!ready) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          {t("email", "Email")}
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === "phone" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          {t("phone", "Phone")}
        </button>
      </div>

      {mode === "email" ? (
        <InputField
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder", "Email address")}
        />
      ) : (
        <PhoneNumberInput
          defaultCountry="th"
          value={phone}
          onChange={setPhone}
          onValidityChange={setPhoneValid}
          placeholder={t("phonePlaceholder", "Phone number")}
        />
      )}
      {mode === "email" && email.trim() && !EMAIL_PATTERN.test(email.trim()) && (
        <p className="-mt-2 text-xs text-red-500">
          {t("emailInvalid", "Please enter a valid email address.")}
        </p>
      )}
      {mode === "phone" && phoneValid === false && (
        <p className="-mt-2 text-xs text-red-500">
          {t("phoneInvalid", "Please enter a valid phone number.")}
        </p>
      )}

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
        inputProps={{ name: "new-password", autoComplete: "new-password" }}
      />

      <div className="text-xs text-gray-500">{t("passwordRequirements")}</div>

      <PasswordInput
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t("confirmPassword")}
        inputProps={{ name: "confirm-password", autoComplete: "new-password" }}
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
