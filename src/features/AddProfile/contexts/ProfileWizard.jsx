import { createContext, useContext, useState, useEffect } from "react"

const WizardContext = createContext()

export const WizardProvider = ({ children }) => {
  const STORAGE_KEY = "profileWizardData"

  const defaultFormData = {
    name: "",
    bio: "",
    age: "",
    socialMediaLinks: [],

    profilePhoto: null,
    profilePhotos: [],

    interests: [],
    languages: [],

    location: {
      coordinates: {
        lat: null,
        lon: null
      },
      placeName: "",
      countryCode: "",
      h3: {
        r4: ""
      }
    },

    searchRadius: {
      distance: 25,
      unit: "km"
    }
  }

  const saved = sessionStorage.getItem(STORAGE_KEY)
  const initialData = saved
    ? { ...defaultFormData, ...JSON.parse(saved) }
    : defaultFormData

  const [formData, setFormData] = useState(initialData)

  useEffect(() => {
    const { profilePhoto, profilePhotos, ...rest } = formData
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  }, [formData])

  const clearFormData = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setFormData(defaultFormData)
  }

  return (
    <WizardContext.Provider
      value={{ formData, setFormData, clearFormData }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export const useWizard = () => useContext(WizardContext)
