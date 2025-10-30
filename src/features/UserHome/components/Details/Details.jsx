import React from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdWorkOutline } from "react-icons/md";
import { useTranslation } from "react-i18next";

/**
 * DetailSection - matches screenshot: both the main info
 * and health status appear as separate rounded cards.
 */
function DetailSection({ profile }) {
  const { t } = useTranslation("common");

  const { stdStatus = "", lastTestedDate = "" } = profile.healthStatus || {};

  const displayStatus =
    stdStatus === "n"
      ? t("stdStatusNegative")
      : stdStatus === "p"
      ? t("stdStatusPositive")
      : t("stdStatusUnknown");

  // Soft pastel colors for interests
  const badgeColors = [
    "#E3F2FD", // blue
    "#FFF3E0", // orange
    "#F3E5F5", // purple
    "#E8F5E9", // green
    "#FFF8E1", // yellow
    "#FCE4EC", // pink
    "#F5F5F5", // gray fallback
  ];
  const getColorFor = (str, idx) => {
    const hash = [...str].reduce((a, c) => a + c.charCodeAt(0), 0);
    return badgeColors[(hash + idx) % badgeColors.length];
  };

  return (
    <div className="-mt-12 px-4 pb-6 space-y-4">
      {/* 🟩 Main details card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        {/* About */}
        <section>
          <h3 className="font-semibold text-gray-800 text-base">{t("aboutMe")}</h3>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
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
        </section>

        {/* Languages */}
        {profile.languages?.length > 0 && (
          <section className="mt-5">
            <h3 className="font-semibold text-gray-800 text-sm">{t("languages")}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1 bg-gray-100 text-sm rounded-full text-gray-700"
                >
                  {lang}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <section className="mt-5">
            <h3 className="font-semibold text-gray-800 text-sm">{t("interests")}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.interests.map((interest, i) => (
                <span
                  key={`${interest}-${i}`}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: getColorFor(interest, i),
                    color: "#1f2937",
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 🟩 Separate Health Status card */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">{t("healthStatus")}</h3>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">{t("stdStatusLabel")}</span>
            <span className="font-medium mt-1">{displayStatus}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">{t("testedOn")}</span>
            <span className="font-medium mt-1">{lastTestedDate || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailSection;
