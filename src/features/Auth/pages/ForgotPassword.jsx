import React, { useState } from "react";
import { InputField } from "../../../shared/common";
import PasswordInput from "../../../shared/Passinput";
import { Button } from "../../../shared/Button";
import { useNavigate } from "react-router-dom";
import { useForgotPassword, useConfirmForgotPassword } from "../useAuth";

export const ForgotAndResetPassword = () => {
  const [step, setStep] = (useState < "forgot") | ("reset" > "forgot");
  const [email, setEmail] = useState("");
  const [ConfirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();

  const forgotPassword = useForgotPassword();
  const confirmForgotPassword = useConfirmForgotPassword();

  // ─── SEND RESET CODE ─────────────────────────────────────
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email) {
      setLocalError("Please enter your email.");
      return;
    }

    forgotPassword.mutate(
      { email },
      {
        onSuccess: () => {
          setStep("reset");
        },
      }
    );
  };

  // ─── CONFIRM RESET ───────────────────────────────────────
  const handleResetSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!ConfirmationCode || !newPassword || !confirmPassword) {
      setLocalError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    confirmForgotPassword.mutate(
      {
        email,
        ConfirmationCode,
        Password: newPassword,
      },
      {
        onSuccess: () => {
          setTimeout(() => navigate("/login"), 1500);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
        {step === "forgot" ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
              Reset Password
            </h1>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <InputField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />

              {(localError || forgotPassword.isError) && (
                <p className="text-red-500 text-sm">
                  {localError ||
                    forgotPassword.error?.response?.data?.error ||
                    "Failed to send reset code."}
                </p>
              )}

              {forgotPassword.isSuccess && (
                <p className="text-green-500 text-sm">
                  Reset code sent successfully.
                </p>
              )}

              <Button type="submit" disabled={forgotPassword.isPending}>
                {forgotPassword.isPending ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
              Reset Password
            </h1>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <InputField value={email} disabled />

              <InputField
                value={ConfirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter confirmation code"
              />

              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />

              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />

              {(localError || confirmForgotPassword.isError) && (
                <p className="text-red-500 text-sm">
                  {localError ||
                    confirmForgotPassword.error?.response?.data?.error ||
                    "Password reset failed."}
                </p>
              )}

              {confirmForgotPassword.isSuccess && (
                <p className="text-green-500 text-sm">
                  Password reset successfully.
                </p>
              )}

              <Button type="submit" disabled={confirmForgotPassword.isPending}>
                {confirmForgotPassword.isPending
                  ? "Resetting..."
                  : "Reset Password"}
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-pink-600 font-semibold text-sm hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
