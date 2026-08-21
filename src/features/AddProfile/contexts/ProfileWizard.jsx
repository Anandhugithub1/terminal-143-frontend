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
  // a refresh mid-wizard, e.g. from network lag or a mobile reload. A slot
  // saved mid-upload restores with status "uploading" but no upload actually
  // in flight anymore (the page reloaded) — reset those to "error" so the
  // slot shows a retry affordance instead of a spinner that will never
  // resolve.
  const resetStuckSlot = (slot) =>
    slot?.status === "uploading" ? { ...slot, status: "error" } : slot

  useEffect(() => {
    let cancelled = false

    // Only restore if `saved` (sessionStorage) shows this is really a reload
    // of an in-progress wizard session — sessionStorage clears on tab/browser
    // close, so its absence means a genuinely fresh visit. Restoring
    // unconditionally here previously meant IndexedDB — which has no expiry
    // and isn't scoped to a session at all — would silently resurrect
    // whatever file was sitting in a slot from a PREVIOUS, possibly abandoned
    // wizard run (different account, different day) into a brand-new signup,
    // with no re-pick and no indication to the user. A fresh visit instead
    // clears any such leftover so it can't resurface in a later session either.
    if (!saved) {
      clearWizardPhotos().catch((err) => {
        console.warn("Failed to clear stale wizard photos", err)
      })
      return
    }

    loadWizardPhotos().then((stored) => {
      if (cancelled || !stored) return
      setFormDataState((prev) => ({
        ...prev,
        profilePhoto: prev.profilePhoto ?? resetStuckSlot(stored.profilePhoto) ?? null,
        profilePhotos: prev.profilePhotos?.length
          ? prev.profilePhotos
          : (stored.profilePhotos || []).map(resetStuckSlot),
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