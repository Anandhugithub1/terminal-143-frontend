import React, { useRef, useState, useMemo } from "react"
import { useWizard } from "../../contexts/ProfileWizard"
import { useNavigate } from "react-router-dom"
import { ProgressBar } from "./Progess"
import PhotoGrid from "../../components/PhotoGrid"
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
    if (isSinglePhoto) return [formData.profilePhoto || null]

    const arr = [...(formData.profilePhotos || [])]
    while (arr.length < maxSlots) arr.push(null)
    return arr
  }, [formData, isSinglePhoto, maxSlots])

  const handleSlotChange = (index) => {
    if (uploading) return
    inputRef.current.dataset.index = index
    inputRef.current.click()
  }

  const handleSlotRemove = (index) => {
    if (isSinglePhoto) {
      setFormData(p => ({ ...p, profilePhoto: null }))
    } else {
      const next = [...photos]
      next[index] = null
      setFormData(p => ({ ...p, profilePhotos: next }))
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const index = Number(e.target.dataset.index) || 0
    e.target.value = ""

    setUploading(true)

    const clonedFile = new File([file], file.name, {
      type: file.type,
      lastModified: file.lastModified
    })

    if (isSinglePhoto) {
      setFormData(p => ({
        ...p,
        profilePhoto: clonedFile
      }))
    } else {
      setFormData(p => {
        const next = [...photos]
        next[index] = clonedFile
        return { ...p, profilePhotos: next }
      })
    }

    setUploading(false)
  }

  return (
    <div className="animate-fade-in">
      <ProgressBar step={4} totalSteps={5} />

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
          className="flex-1 py-3 border bg-white"
        >
          Back
        </Button>

        <Button
          onClick={() => navigate("/complete/tags")}
          className="flex-1 py-3"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Photo
