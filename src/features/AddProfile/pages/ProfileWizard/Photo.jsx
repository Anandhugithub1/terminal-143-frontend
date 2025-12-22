import React, { useRef, useState, useEffect, useMemo } from "react"
import { useWizard } from "../../contexts/ProfileWizard"
import { useNavigate } from "react-router-dom"
import { ProgressBar } from "./Progess"
import PhotoGrid from "../../components/PhotoGrid"
import { set, get, del } from "idb-keyval"
import { Button } from "../../../../shared/Button"

const SINGLE_PHOTO_GENDERS = ["M", "TM"]

const Photo = () => {
  const { formData, setFormData } = useWizard()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const gender = localStorage.getItem("gender")
  const isSinglePhoto = SINGLE_PHOTO_GENDERS.includes(gender)

  const maxSlots = isSinglePhoto ? 1 : 3

  const photos = useMemo(() => {
    if (isSinglePhoto) {
      return [formData.profilePhoto || null]
    }
    const arr = [...(formData.profilePhotos || [])]
    while (arr.length < maxSlots) arr.push(null)
    return arr
  }, [formData, isSinglePhoto, maxSlots])

  /* ---------- Load persisted files ---------- */
  useEffect(() => {
    const load = async () => {
      if (isSinglePhoto) {
        const photo = await get("profilePhoto")
        if (photo) {
          setFormData((p) => ({ ...p, profilePhoto: photo }))
        }
      } else {
        const saved = await get("profilePhotos")
        if (Array.isArray(saved)) {
          const filled = [...saved]
          while (filled.length < maxSlots) filled.push(null)
          setFormData((p) => ({ ...p, profilePhotos: filled }))
        }
      }
    }
    load()
  }, [isSinglePhoto, maxSlots, setFormData])

  /* ---------- Slot actions ---------- */
  const handleSlotChange = (index) => {
    if (uploading || !inputRef.current) return
    inputRef.current.dataset.replaceIndex = index
    inputRef.current.click()
  }

  const handleSlotRemove = async (index) => {
    if (uploading) return

    if (isSinglePhoto) {
      setFormData((p) => ({ ...p, profilePhoto: null }))
      await del("profilePhoto")
    } else {
      const next = [...photos]
      next[index] = null //  DO NOT SPLICE
      setFormData((p) => ({ ...p, profilePhotos: next }))
      await set("profilePhotos", next)
    }
  }

  /*Upload handle */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    let index = Number(e.target.dataset.replaceIndex)
    if (Number.isNaN(index)) index = 0

    if (isSinglePhoto) {
      setFormData((p) => ({ ...p, profilePhoto: file }))
      await set("profilePhoto", file)
    } else {
      const next = [...photos]
      next[index] = file
      setFormData((p) => ({ ...p, profilePhotos: next }))
      await set("profilePhotos", next)
    }

    e.target.value = ""
    delete e.target.dataset.replaceIndex
    setUploading(false)
  }

  return (
    <div className="animate-fade-in">
      <ProgressBar step={4} totalSteps={5} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isSinglePhoto ? "Upload Your Photo" : "Show Your Sparkle ✨"}
        </h2>
        <p className="text-gray-500">
          {isSinglePhoto
            ? "Upload your profile photo"
            : `Upload up to ${maxSlots} photos`}
        </p>
      </div>

      <PhotoGrid
        photos={photos}
        maxSlots={maxSlots}
        onSlotChange={handleSlotChange}
        onSlotRemove={handleSlotRemove}
        uploading={uploading}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      <div className="mt-8 flex gap-4">
        <Button
          onClick={() => navigate("/complete/bio")}
          textColor="black"
          className="flex-1 py-3 px-6 border border-gray-200 bg-white"
          disabled={uploading}
        >
          Back
        </Button>

        <Button
          onClick={() => navigate("/complete/tags")}
          className="flex-1 py-3 px-6"
          disabled={uploading}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Photo
