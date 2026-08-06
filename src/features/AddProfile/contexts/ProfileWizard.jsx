import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { saveWizardPhotos, loadWizardPhotos, clearWizardPhotos } from "./wizardPhotoStore"

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
 preferences: [],

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

  // Recover picked photos (File objects can't live in sessionStorage) after
  // a refresh mid-wizard, e.g. from network lag or a mobile reload.
  useEffect(() => {
    let cancelled = false

    loadWizardPhotos().then((stored) => {
      if (cancelled || !stored) return
      setFormDataState((prev) => ({
        ...prev,
        profilePhoto: prev.profilePhoto ?? stored.profilePhoto ?? null,
        profilePhotos:
          prev.profilePhotos?.length ? prev.profilePhotos : stored.profilePhotos || [],
      }))
    }).catch((err) => {
      console.warn("Failed to restore wizard photos", err)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const isInitialPhotoMount = useRef(true)

  useEffect(() => {
    if (isInitialPhotoMount.current) {
      isInitialPhotoMount.current = false
      return
    }

    const { profilePhoto, profilePhotos } = formData
    const hasAnyPhoto = Boolean(profilePhoto) || (profilePhotos || []).some(Boolean)

    const op = hasAnyPhoto
      ? saveWizardPhotos({ profilePhoto, profilePhotos })
      : clearWizardPhotos()

    op.catch((err) => {
      console.warn("Failed to persist wizard photos", err)
    })
  }, [formData.profilePhoto, formData.profilePhotos])

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
    clearWizardPhotos().catch((err) => {
      console.warn("Failed to clear wizard photos", err)
    })
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