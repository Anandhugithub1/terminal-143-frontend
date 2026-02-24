import { useEffect } from "react"
import { useTranslation } from "react-i18next"

export default function LanguageSync() {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.language) {
      const lang = i18n.language.split("-")[0]
      document.documentElement.lang = lang
    }
  }, [i18n.language])

  return null
}