import React, { useState } from "react";
import { InputField } from "../../../shared/common";
import PasswordInput from "../../../shared/Passinput";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../shared/Button";
import Loader from "../../../components/Ui/Loading";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLogin } from "../useAuth";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";
import ReviewsSection from "../../../pages/Global/components/Review";

const LoginForm = () => {
  const { t } = useTranslation("auth");
  const [emailPhone, setEmailPhone] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailPhone || !password) {
      return toast.error(t("enterCredentials"));
    }

    mutate(
      { emailPhone, password },
      {
        onSuccess: (data) => {
  toast.success(t("loginSuccessful"));

  if (data.gender) {
    localStorage.setItem("gender", data.gender);
  }

  // Prevent instant navigation
  setTimeout(() => {
    if (data.profileCompleted === true) {
      navigate("/home", { state: { justLoggedIn: true } });
    } else {
      navigate("/complete");
    }
  }, 600); // 600ms feels natural, not too fast
},

        onError: (err) => {
          const apiErr = err?.response?.data;

          if (apiErr?.notVerified === true) {
            navigate(
              `/verify?email=${encodeURIComponent(emailPhone)}`
            );
          } else {
            toast.error(
              apiErr?.error ||
              apiErr?.message ||
              t("loginFailed")
            );
          }
        },
      }
    );
  };

  return (
    <>
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <Loader />
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-3 rounded-full">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
        {t("welcomeBack")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          value={emailPhone}
          onChange={(e) => setEmailPhone(e.target.value)}
          placeholder={t("emailOrPhone")}
          disabled={isPending}
        />

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("password")}
          disabled={isPending}
        />

        <div className="text-right">
          <Link
            to="/reset-password"
            className="text-text-pr font-semibold text-sm hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {isError && (
          <p className="text-red-500 text-sm">
            {getErrorMessage(error)}
          </p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader /> : t("login")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("noAccount")}{" "}
        <Link
          to="/register"
          className="text-text-pr font-semibold hover:underline"
        >
          {t("register")}
        </Link>
      </p>

      
    </>
  );
};

export default LoginForm;