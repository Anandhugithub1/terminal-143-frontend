import { Users } from "lucide-react";
import PageHeader from "../../shared/components/PageHeader";
import "@fontsource-variable/inter";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useMyProfile } from "../../features/UserProfile/Hooks/useMyProfile";
import { updateMyProfile } from "../../features/UserProfile/api/profile";
import { getErrorMessage } from "../../shared/api/getErrorMessage";

export default function PrivacyPage() {
  const { t } = useTranslation("settings");
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useMyProfile();
  const showCircleActivity = profile?.showCircleActivity ?? true;

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onMutate: async (payload) => {
      // Instant toggle feel — the write is a single boolean, low risk of
      // a real conflict, and onError below rolls this back if it fails.
      await queryClient.cancelQueries({ queryKey: ["my-profile"] });
      const previous = queryClient.getQueryData(["my-profile"]);
      queryClient.setQueryData(["my-profile"], (old) =>
        old ? { ...old, showCircleActivity: payload.showCircleActivity } : old
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success(t("privacyPage.updateSuccess"));
    },
    onError: (err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["my-profile"], context.previous);
      }
      toast.error(getErrorMessage(err, "generic") || t("privacyPage.updateFailed"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });

  const handleToggle = () => {
    if (mutation.isPending || isLoading) return;
    mutation.mutate({ showCircleActivity: !showCircleActivity });
  };

  return (
    <div className="min-h-[100dvh] bg-white font-inter">
      <PageHeader title={t("privacyPage.title")} />

      <main className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-gray-500" />
          <h2 className="text-gray-900 text-base font-bold">
            {t("privacyPage.circleActivityHeading")}
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          {t("privacyPage.circleActivityDescription")}
        </p>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading || mutation.isPending}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border border-gray-200 bg-white text-left disabled:opacity-60 transition-colors"
        >
          <span className="flex-1 text-sm font-medium text-gray-800">
            {t("privacyPage.showCircleActivityLabel")}
          </span>
          <span
            className={`w-11 h-6 rounded-full relative shrink-0 transition-colors ${
              showCircleActivity ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                showCircleActivity ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>

        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          {showCircleActivity
            ? t("privacyPage.showCircleActivityOn")
            : t("privacyPage.showCircleActivityOff")}
        </p>
      </main>
    </div>
  );
}
