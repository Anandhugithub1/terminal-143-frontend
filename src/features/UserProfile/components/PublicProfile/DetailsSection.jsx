import React from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdWorkOutline } from "react-icons/md";
import { FiLock } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { getLanguageLabel } from "../../../../Utlis/Global/lanaguage";

/**
 * ProtectedCard
 * - title: heading to show in the floating protected header (e.g. "About me")
 * - subtitle: small helper text (e.g. "Sign in to unlock")
 */
function ProtectedCard({ children, locked = false, className = "", title }) {
const lockClasses = locked ? "filter blur-sm opacity-60 select-none pointer-events-none" : "";


return (
<div
data-protected-card
className={`relative bg-white rounded-2xl shadow-sm p-6 border border-gray-100 overflow-hidden ${className}`}
style={{ minHeight: "140px" }} // increased card height slightly
>
<h3 className="font-semibold text-gray-800 text-base mb-4">{title}</h3>


<div className={`transition-all ${lockClasses}`}>{children}</div>


{locked && (
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
<FiLock size={28} className="text-gray-500 opacity-80" /> {/* increased size */}
</div>
)}
</div>
);
}




function DetailSection({ profile, locked = false }) {
  const { t } = useTranslation("common");
  const { stdStatus = "", lastTestedDate = "" } = profile.healthStatus || {};

  const displayStatus =
    stdStatus === "n" ? t("stdStatusNegative") :
    stdStatus === "p" ? t("stdStatusPositive") :
    t("stdStatusUnknown");

  return (
    <div className="space-y-4">

      {/* ABOUT ME */}
      <ProtectedCard locked={locked} title={t("aboutMe")}>
        <p className="text-sm text-gray-500 leading-relaxed">
          {profile.about || t("noBioAvailable")}
        </p>

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
                  style={{ backgroundColor: "#F3F4F6", color: "#1f2937" }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </ProtectedCard>


      {/* HEALTH STATUS */}
      <ProtectedCard locked={locked} title={t("healthStatus")}>
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
