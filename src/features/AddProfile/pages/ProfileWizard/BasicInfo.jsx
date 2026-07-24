import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../../contexts/ProfileWizard'
import { InputField } from '../../../../shared/common'
import { ProgressBar } from './Progess'
import { Button } from '../../../../shared/Button'
import SocialLinkInput from '../../components/SocialLinkInput'
import SocialLinkChip from '../../components/SocialLinkChip'
import { AiOutlineCalendar } from 'react-icons/ai'

import {
  calculateAge,
  validateLink,
  PREFERENCES,
  SOCIAL_PLATFORMS
} from '../../utlis'
import { useTranslation } from 'react-i18next'

const MAX_PREFERENCES = 5

const Step1BasicInfo = () => {
  const { formData, setFormData } = useWizard()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [socialPlatform, setSocialPlatform] = useState('')
  const [socialInput, setSocialInput] = useState('')

  const dobRef = useRef(null)
  const { t } = useTranslation('common')

  const currentYear = new Date().getFullYear()
  const minDob = '1950-01-01'
  const maxDob = `${currentYear}-12-31`

  const preferences = formData?.preferences || []

  const isNextDisabled =
    !formData?.name?.trim() ||
    !formData?.dob ||
    calculateAge(formData.dob) < 18 ||
    preferences.length === 0

  useEffect(() => {
    if (!error) return

    if (
      formData?.name?.trim() &&
      formData?.dob &&
      calculateAge(formData.dob) >= 18 &&
      preferences.length > 0
    ) {
      setError('')
    }
  }, [
    formData?.name,
    formData?.dob,
    preferences
  ])

  const handleNext = () => {
    if (!formData?.name?.trim()) {
      setError(t('nameError'))
      return
    }

    if (!formData?.dob) {
      setError(t('dobRequired'))
      return
    }

    if (calculateAge(formData.dob) < 18) {
      setError(t('dobError'))
      return
    }

    if (preferences.length === 0) {
      setError(t('preferencesRequired'))
      return
    }

    setError('')
    navigate('/complete/location')
  }

  const togglePreference = (value) => {
    setFormData((prev) => {
      const prefs = prev.preferences || []

      if (prefs.includes(value)) {
        return {
          ...prev,
          preferences: prefs.filter((p) => p !== value)
        }
      }

      if (prefs.length >= MAX_PREFERENCES) {
        return prev
      }

      return {
        ...prev,
        preferences: [...prefs, value]
      }
    })
  }

  const addSocialLink = () => {
    const trimmed = socialInput.trim()
    if (!socialPlatform || !trimmed) return
    if (!validateLink(trimmed)) {
      setError(t('invalidLink'))
      return
    }

    setFormData((p) => ({
      ...p,
      socialMediaLinks: [
        ...(p.socialMediaLinks || []),
        { platform: socialPlatform, usernameOrLink: trimmed }
      ]
    }))

    setSocialInput('')
    setSocialPlatform('')
    setError('')
  }

  const removeSocialLink = (index) => {
    setFormData((p) => ({
      ...p,
      socialMediaLinks: (p.socialMediaLinks || []).filter(
        (_, i) => i !== index
      )
    }))
  }

  return (
    <div className="animate-fade-in">
      <ProgressBar step={1} totalSteps={5} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t('title')}
        </h2>
        <p className="text-gray-500">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        <InputField
          id="fullName"
          value={formData?.name || ''}
          onChange={(e) =>
            setFormData((p) => ({ ...p, name: e.target.value }))
          }
          placeholder={t('fullName')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('dob')}
          </label>

          <div className="relative mt-1">
            <InputField
              ref={dobRef}
              type="date"
              value={formData?.dob || ''}
              min={minDob}
              max={maxDob}
              onChange={(e) => {
                const dob = e.target.value
                setFormData((p) => ({ ...p, dob }))

                if (dob && calculateAge(dob) < 18) {
                  setError(t('dobError'))
                } else {
                  setError('')
                }
              }}
            />

            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={() => dobRef.current?.showPicker?.()}
            >
              <AiOutlineCalendar size={20} />
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-3">
            {t('preferencesTitle')}
          </label>

          {preferences.length >= MAX_PREFERENCES && (
            <p className="text-xs text-gray-400 mb-2">
              {t('maxTwoPreferences') ||
                'You can select up to 2 preferences only'}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {Object.entries(PREFERENCES).map(([label, value]) => {
              const selected = preferences.includes(value)
              const disabled =
                !selected && preferences.length >= MAX_PREFERENCES

              return (
                <button
                  key={value}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => togglePreference(value)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                    selected
                      ? 'bg-pink-500 text-white'
                      : disabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {t(`preferences.${value}`, label)}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t('socialLabel')} <span className="text-gray-400 font-normal">{t('socialOptional') || '(optional)'}</span>
          </label>

<p className="text-xs text-gray-500 mb-2">
  {t('socialPrivacyNote') ||
    'Your social links stay private and are shared only when there’s a match'}
</p>

          <SocialLinkInput
            platforms={SOCIAL_PLATFORMS}
            selectedPlatform={socialPlatform}
            input={socialInput}
            onPlatformChange={(e) => setSocialPlatform(e.target.value)}
            onInputChange={(e) => setSocialInput(e.target.value)}
            onAdd={addSocialLink}
            disabled={!socialPlatform || !socialInput.trim()}
          />

          {formData?.socialMediaLinks?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.socialMediaLinks.map((link, i) => (
                <SocialLinkChip
                  key={i}
                  {...link}
                  onRemove={() => removeSocialLink(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

   <Button
  onClick={handleNext}
  disabled={isNextDisabled}
  className={`mt-8 w-full transition-all ${
    isNextDisabled
      ? 'bg-gray-300 cursor-not-allowed'
      : 'bg-pink-500 hover:bg-pink-600 active:scale-95'
  }`}
>
  {t('continue')}
</Button>

    </div>
  )
}

export default Step1BasicInfo
