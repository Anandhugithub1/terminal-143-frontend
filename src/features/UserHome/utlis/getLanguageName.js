import i18n from "i18next"

const languageDisplay = new Intl.DisplayNames(
  [i18n.language || "en"],
  { type: "language" }
)

export function getLanguageName(code) {
  if (!code) return ""

  try {
    return languageDisplay.of(code)
  } catch {
    return code.toUpperCase()
  }
}
