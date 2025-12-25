import React, {
  useState,
  useRef,
  useMemo,
  useEffect
} from "react"
import { useWizard } from "../../contexts/ProfileWizard"
import { useNavigate } from "react-router-dom"
import { ProgressBar } from "./Progess"
import { Button } from "../../../../shared/Button"
import { useMutation } from "@tanstack/react-query"
import { categories } from "../../utlis"
import { toast } from "sonner"
import { normalizeGeoForApi } from "../../utlis/geo"
import {
  getPresignedUrl,
  completeProfileApi
} from "../../../UserProfile/api/profile"
import { Checkbox } from "@headlessui/react"

const SINGLE_PHOTO_GENDERS = ["M", "TM"]

export default function Tags() {
  const { formData, setFormData, clearFormData } = useWizard()
  const navigate = useNavigate()

  const gender = localStorage.getItem("gender")
  const isSinglePhoto = SINGLE_PHOTO_GENDERS.includes(gender)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const isMountedRef = useRef(true)
  const submittingRef = useRef(false)

  /* ============================
     Lifecycle safety
     ============================ */
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /* ============================
     Prevent refresh / tab close
     ============================ */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submittingRef.current) return
      e.preventDefault()
      e.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  /* ============================
     Interests
     ============================ */
  const selectedInterests = useMemo(() => {
    return Object.keys(categories).flatMap(
      (cat) => formData[cat] || []
    )
  }, [formData])

  const hasAtLeastOneInterest = selectedInterests.length > 0

  /* ============================
     Mutation
     ============================ */
const completeMutation = useMutation({
  mutationFn: completeProfileApi,

  onSuccess: () => {
    submittingRef.current = false
    clearFormData()
      toast.success(" Your profile is ready! Welcome aboard.", {
    duration: 3000
  })
  setTimeout(() => {
    navigate("/home", {
      state: { profileJustCompleted: true }
    })
  }, 500)


  },

  onError: (err) => {
    submittingRef.current = false
    toast.error(
      err?.response?.data?.message || "Profile completion failed"
    )
  },

  onSettled: () => {
    submittingRef.current = false
    setIsSubmitting(false)
  }
})

  /* ============================
     Upload helper
     ============================ */
  const uploadSinglePhoto = async (file, index) => {
    const { uploadUrl, publicUrl } =
      await getPresignedUrl({
        fileType: file.type,
        photoIndex: index
      })

    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file
    })

    return publicUrl
  }

  /* ============================
     Submit
     ============================ */
  const handleSubmit = async () => {
  if (submittingRef.current) return

  if (!hasAtLeastOneInterest) {
    toast.error("Select at least one interest")
    return
  }

  submittingRef.current = true
  setIsSubmitting(true)

  toast.warning(
    "Please don’t refresh or leave this page while we finish setting up your profile.",
    { duration: 5000 }
  )

  try {
    const files = isSinglePhoto
      ? [formData.profilePhoto].filter(Boolean)
      : (formData.profilePhotos || []).filter(Boolean)

    if (!files.length) {
      throw new Error("NO_PHOTOS")
    }

    const photos = []

    for (let i = 0; i < files.length; i++) {
      const url = await uploadSinglePhoto(files[i], i)
      photos.push({
        url,
        isProfile: i === 0,
        order: i
      })
    }

    const payload = {
      ...formData,
      interests: selectedInterests,
      photos,
      searchRadius: {
        distance: Number(formData.searchRadius?.distance) || 25,
        unit: formData.searchRadius?.unit || "km"
      }
    }

    const normalizedLocation = normalizeGeoForApi(formData.location)
    if (normalizedLocation) payload.location = normalizedLocation

    console.log("FINAL PAYLOAD →", payload)

    await completeMutation.mutateAsync(payload)

  } catch (err) {
    console.error("Profile completion error:", err)

    if (err.message === "NO_PHOTOS") {
      toast.error("Please upload at least one photo")
    } else {
      toast.error("Something went wrong")
    }

    submittingRef.current = false
    setIsSubmitting(false)
  }
}


  /* ============================
     Toggle interests
     ============================ */
  const toggleInterest = (category, value, checked) => {
    setFormData((prev) => {
      const current = prev[category] || []
      return {
        ...prev,
        [category]: checked
          ? current.includes(value)
            ? current
            : [...current, value]
          : current.filter((v) => v !== value)
      }
    })
  }

  /* ============================
     Render
     ============================ */
  return (
    <div className="animate-fade-in">
      <ProgressBar step={5} totalSteps={5} />

      {isSubmitting && (
        <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <strong>Almost done!</strong>{" "}
          Please don’t refresh or leave this page.
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Final Touch!
        </h2>
        <p className="text-gray-500">
          Select your interests to find better matches
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(categories).map(([title, items]) => (
          <div key={title}>
            <h3 className="text-lg font-semibold mb-4">
              {title}
            </h3>

            <div className="flex flex-wrap gap-3">
              {items.map((item) => {
                const checked =
                  (formData[title] || []).includes(item)

                return (
                  <Checkbox
                    key={item}
                    checked={checked}
                    disabled={isSubmitting}
                    onChange={(val) =>
                      toggleInterest(title, item, val)
                    }
                    className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition ${
                      checked
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item}
                  </Checkbox>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {errorMessage && (
        <p className="text-center mt-4 text-red-500">
          {errorMessage}
        </p>
      )}

      {!hasAtLeastOneInterest && (
        <p className="text-center mt-4 text-sm text-gray-400">
          Select at least one interest to continue
        </p>
      )}

      <div className="mt-8 flex gap-4">
        <Button
          onClick={() => navigate("/complete/photo")}
          disabled={isSubmitting}
          textColor="black"
          className="flex-1 py-3 border border-gray-200 bg-white"
        >
          Back
        </Button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !hasAtLeastOneInterest}
          className={`flex-1 font-semibold py-3 px-6 rounded-3xl transition ${
            isSubmitting || !hasAtLeastOneInterest
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white"
          }`}
        >
          {isSubmitting ? "Saving..." : "Finish Setup"}
        </button>
      </div>
    </div>
  )
}
