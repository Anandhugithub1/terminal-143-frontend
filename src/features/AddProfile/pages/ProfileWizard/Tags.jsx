import React, {
  useState,
  useRef,
  useMemo,
  useEffect
} from "react"
import { useWizard } from "../../contexts/ProfileWizard"
import { useNavigate } from "react-router-dom"
import { ProgressBar } from "./Progess"
import { del } from "idb-keyval"
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

  useEffect(() => () => { isMountedRef.current = false }, [])

  const selectedInterests = useMemo(
    () =>
      Object.entries(categories).flatMap(
        ([cat]) => formData[cat] || []
      ),
    [formData]
  )
const hasAtLeastOneInterest = selectedInterests.length > 0

  const completeMutation = useMutation({
    mutationFn: completeProfileApi,
    onSuccess: async () => {
      clearFormData()
     
      navigate("/home", { state: { profileJustCompleted: true } })
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        "Profile completion failed"
      setErrorMessage(msg)
      toast.error(msg)
    },
    onSettled: () => {
      if (isMountedRef.current) setIsSubmitting(false)
    }
  })

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

  const handleSubmit = async () => {
  if (isSubmitting || !hasAtLeastOneInterest) return
  setIsSubmitting(true)


    try {
      const files = isSinglePhoto
        ? [formData.profilePhoto].filter(Boolean)
        : (formData.profilePhotos || []).filter(Boolean)

      if (!files.length) {
        toast.error("Please upload at least one photo")
        setIsSubmitting(false)
        return
      }

      const uploaded = []

      for (let i = 0; i < files.length; i++) {
        const url = await uploadSinglePhoto(files[i], i)
        uploaded.push({
          url,
          isProfile: i === 0,
          order: i
        })
      }

      const payload = {
        ...formData,
        interests: selectedInterests,
        photos: uploaded
      }

      const normalizedLocation =
        normalizeGeoForApi(formData.location)

      if (normalizedLocation)
        payload.location = normalizedLocation
      else delete payload.location

      if (formData.searchRadius) {
        payload.searchRadius = {
          distance:
            Number(formData.searchRadius.distance) || 25,
          unit: formData.searchRadius.unit || "km"
        }
      }

      completeMutation.mutate(payload)
    } catch (err) {
      console.error("Profile completion error:", err)
      toast.error("Something went wrong")
      setIsSubmitting(false)
    }
  }

  const toggleInterest = (category, value, checked) => {
    const current = formData[category] || []

    setFormData({
      ...formData,
      [category]: checked
        ? [...current, value]
        : current.filter((v) => v !== value)
    })
  }

  return (
    <div className="animate-fade-in">
      <ProgressBar step={5} totalSteps={5} />

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
