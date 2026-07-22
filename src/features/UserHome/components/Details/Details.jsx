import React from "react"
import { HiOutlineLocationMarker } from "react-icons/hi"
import { MdWorkOutline } from "react-icons/md"
import { useTranslation } from "react-i18next"
import { getLanguageLabel } from "../../../../Utlis/Global/lanaguage"
import {healthDisclosureOptions} from '../../../AddProfile/utlis/index'
function DetailSection({ profile }) {
  const { t } = useTranslation("common")

  // protect against being called with null/undefined (caller may render
  // before data is ready)
  if (!profile) {
    return null
  }

  const disclosures =
    Array.isArray(profile.healthDisclosures) && profile.healthDisclosures.length > 0
      ? profile.healthDisclosures
      : ["PNS"]

  const disclosureLabelMap = healthDisclosureOptions.reduce((acc, item) => {
    acc[item.value] = item.label
    return acc
  }, {})

  const badgeColors = [
    "#E3F2FD",
    "#FFF3E0",
    "#F3E5F5",
    "#E8F5E9",
    "#FFF8E1",
    "#FCE4EC",
    "#F5F5F5",
  ]

  const getColorFor = (str, idx) => {
    const hash = [...str].reduce((a, c) => a + c.charCodeAt(0), 0)
    return badgeColors[(hash + idx) % badgeColors.length]
  }

  return (
    <div className="pt-1 space-y-4">
      {/* Main details card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <section>
          <h3 className="font-semibold text-gray-800 text-base">
            {t("aboutMe")}
          </h3>

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

        {profile.languages?.length > 0 && (
          <section className="mt-5">
            <h3 className="font-semibold text-gray-800 text-sm">
              {t("languages")}
            </h3>

            <div className="mt-2 flex flex-wrap gap-2">
              {profile.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1 bg-gray-200 text-sm rounded-md text-gray-700"
                >
                  {getLanguageLabel(lang)}
                </span>
              ))}
            </div>
          </section>
        )}

        {profile.interests?.length > 0 && (
          <section className="mt-5">
            <h3 className="font-semibold text-gray-800 text-sm">
              {t("interests")}
            </h3>

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

      {/* Health Disclosure card */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm tracking-wide">
          {t("healthDisclosure")}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {disclosures.map((code, i) => (
            <span
              key={`${code}-${i}`}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: getColorFor(code, i),
                color: "#1f2937",
              }}
            >
              {disclosureLabelMap[code] || code}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DetailSection
