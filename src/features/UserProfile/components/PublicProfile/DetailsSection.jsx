import React from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdWorkOutline } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { getLanguageLabel } from "../../../../Utlis/Global/lanaguage";

/** small wrapper to avoid repeating blur/select-none classes and data attribute */
function ProtectedCard({ children, locked = false, className = "" }) {
  const lockClasses = locked ? "filter blur-sm opacity-60 select-none pointer-events-none" : "";
  return (
    <div data-protected-card className={`relative bg-white rounded-2xl shadow-sm p-5 border border-gray-100 overflow-hidden ${className}`}>
      <div className={`transition-all ${lockClasses}`}>{children}</div>
    </div>
  );
}

function DetailSection({ profile, locked = false }) {
  const { t } = useTranslation("common");
  const { stdStatus = "", lastTestedDate = "" } = profile.healthStatus || {};

  const displayStatus =
    stdStatus === "n" ? t("stdStatusNegative") : stdStatus === "p" ? t("stdStatusPositive") : t("stdStatusUnknown");

  const badgeColors = ["#E3F2FD", "#FFF3E0", "#F3E5F5", "#E8F5E9", "#FFF8E1", "#FCE4EC", "#F5F5F5"];
  const getColorFor = (str, idx) => {
    const hash = [...(str || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
    return badgeColors[(hash + idx) % badgeColors.length];
  };

  return (
    <div className="space-y-4">
      <ProtectedCard locked={locked}>
        <h3 className="font-semibold text-gray-800 text-base mb-2">{t("aboutMe")}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{profile.about || t("noBioAvailable")}</p>

        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {profile.location && (
            <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
              <HiOutlineLocationMarker className="mr-1" />
              {profile.location}
            </span>
          )}
          {profile.job && (
            <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
              <MdWorkOutline className="mr-1" />
              {profile.job}
            </span>
          )}
        </div>

        {profile.languages?.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm text-gray-800 mb-2">{t("languages")}</h4>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((lang) => (
                <span key={lang} className="px-3 py-1 bg-gray-200 text-sm rounded-md text-gray-700">
                  {getLanguageLabel(lang)}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.interests?.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm text-gray-800 mb-2">{t("interests")}</h4>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, i) => (
                <span
                  key={`${interest}-${i}`}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: getColorFor(interest, i), color: "#1f2937" }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </ProtectedCard>

      <ProtectedCard locked={locked}>
        <h3 className="font-semibold text-gray-800 text-sm tracking-wide mb-2">{t("healthStatus")}</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{t("stdStatusLabel")}</span>
            <span className="font-medium text-gray-800">{displayStatus}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">{t("testedOn")}</span>
            <span className="font-medium text-gray-800">{lastTestedDate || "—"}</span>
          </div>
        </div>
      </ProtectedCard>
    </div>
  );
}

export default DetailSection;
