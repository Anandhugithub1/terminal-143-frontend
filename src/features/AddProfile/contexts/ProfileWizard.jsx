import { createContext, useContext, useState, useEffect, useCallback } from "react"

const WizardContext = createContext()

const STORAGE_KEY = "profileWizardData"

const getDefaultFormData = () => ({
  name: "",
  bio: "",
  age: "",
  socialMediaLinks: [],

  profilePhoto: null,
  profilePhotos: [],

  interests: [],
  languagesKnown: [],


  location: {
    coordinates: {
      lat: null,
      lon: null
    },
    placeName: "",
    countryCode: "",
    admin1: null,
    h3: {
      r4: ""
    }
  },

  searchRadius: {
    distance: 25,
    unit: "km"
  }
})



export const WizardProvider = ({ children }) => {
  const saved = sessionStorage.getItem(STORAGE_KEY)

  const initialData = saved
    ? { ...getDefaultFormData(), ...JSON.parse(saved) }
    : getDefaultFormData()

  const [formData, setFormDataState] = useState(initialData)

  useEffect(() => {
    const { profilePhoto, profilePhotos, ...rest } = formData
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  }, [formData])

const setFormData = (updater) => {
  setFormDataState(prev => {
    const next =
      typeof updater === "function"
        ? updater(prev)
        : updater

    return { ...prev, ...next }
  })
}


  const clearFormData = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setFormDataState(getDefaultFormData())
  }, [])

  return (
    <WizardContext.Provider
      value={{
        formData,
        setFormData,
        clearFormData
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export const useWizard = () => {
  const ctx = useContext(WizardContext)
  if (!ctx) {
    throw new Error("useWizard must be used inside WizardProvider")
  }
  return ctx
}