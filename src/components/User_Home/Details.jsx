import React from "react";
import { RxCross1, RxHeart } from "react-icons/rx";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { AiOutlineReload } from "react-icons/ai";
import { useTranslation } from "react-i18next";

export function DetailSection({ profile }) {
  const { t } = useTranslation('common');

  // Safely destructure with fallback
  const {
    stdStatus = '',
    lastTestedDate = '',
  } = profile.healthStatus || {};

  const displayStatus =
    stdStatus === "n"
      ? t("stdStatusNegative")
      : stdStatus === "p"
      ? t("stdStatusPositive")
      : t("stdStatusUnknown");

  return (
    <div className="-mt-12 bg-white rounded-t-3xl p-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-3 text-gray-500">
          <button><RxCross1 size={20} /></button>
          <button><AiOutlineReload size={20} /></button>
          <button><RxHeart size={20} /></button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* About me */}
        <section>
          <h3 className="font-medium">{t("aboutMe")}</h3>
          <p className="mt-1 text-gray-500">{profile.about}</p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <HiOutlineLocationMarker />
            <span>{profile.location || t("locationUnknown")}</span>
          </div>
        </section>

        {/* Languages */}
        <section>
          <h3 className="font-medium">{t("languages")}</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {profile.languages?.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {lang}
              </span>
            ))}
          </div>
        </section>

        {/* Interests */}
        <section>
          <h3 className="font-medium">{t("interests")}</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {profile.interests?.map((it) => (
              <span
                key={it}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {it}
              </span>
            ))}
          </div>
        </section>

        {/* Health Status */}
        <section>
          <h3 className="font-medium">{t("healthStatus")}</h3>
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            <p>
              {t("stdStatusLabel")}:{" "}
              <span className="font-medium">{displayStatus}</span>
            </p>
            <p>
              {t("testedOn")}:{" "}
              <span className="font-medium">
                {lastTestedDate || t("locationUnknown")}
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
