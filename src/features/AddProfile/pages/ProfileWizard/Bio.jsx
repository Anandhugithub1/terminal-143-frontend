import React, { useState, useEffect } from "react";
import { useWizard } from "../../contexts/ProfileWizard";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./Progess";
import { Button } from "../../../../shared/Button";
import { statusOptions } from "../../utlis";
import useLanguages from "../../hooks/useLanguages";
import LanguagePicker from "../../components/LanguagePicker";

export default function Bio() {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const charLimit = 500;

  const healthStatusFromForm = formData.healthStatus || {
    stdStatus: "",
    lastTestedDate: "",
  };

  const {
    languagesList,
    loading: languagesLoading,
    error: languagesError,
  } = useLanguages();
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  useEffect(() => {
    if (!languagesList.length) return;
    if (
      Array.isArray(formData.languagesKnown) &&
      formData.languagesKnown.length
    ) {
      setSelectedLanguages(
        languagesList.filter((l) => formData.languagesKnown.includes(l.value))
      );
    }
    // run only when languagesList changes (one-time sync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languagesList]);

  const handleNext = () => {
    if (!formData.bio?.trim()) return;
    if (!healthStatusFromForm.stdStatus) return;

    setFormData({
      ...formData,
      languagesKnown: selectedLanguages.map((l) => l.value),
      healthStatus: { ...healthStatusFromForm },
    });
    navigate("/complete/photo");
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-8 animate-fade-in">
      <ProgressBar step={3} totalSteps={5} />

      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">Your Story 💬</h2>
        <textarea
          value={formData.bio || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              bio: e.target.value.slice(0, charLimit),
            })
          }
          placeholder="I'm passionate about..."
          className="w-full p-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500 min-h-[160px]"
        />
        <div className="text-right text-sm text-gray-400">
          {formData.bio?.length || 0}/{charLimit}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-semibold">🌐 Languages You Know</h3>
        <LanguagePicker
          languagesList={languagesList}
          loading={languagesLoading}
          error={languagesError}
          selected={selectedLanguages}
          onChange={setSelectedLanguages}
        />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold">🧬 STD Status</h3>
        <select
          value={healthStatusFromForm.stdStatus}
          onChange={(e) =>
            setFormData({
              ...formData,
              healthStatus: {
                ...healthStatusFromForm,
                stdStatus: e.target.value,
              },
            })
          }
          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
        >
          <option value="" disabled>
            Select your STD status
          </option>
          {statusOptions.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold">🗓️ Last Tested Date</h3>
        <input
          type="date"
          value={healthStatusFromForm.lastTestedDate}
          onChange={(e) =>
            setFormData({
              ...formData,
              healthStatus: {
                ...healthStatusFromForm,
                lastTestedDate: e.target.value,
              },
            })
          }
          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => navigate("/complete/location")}
          textColor="black"
          className="flex-1 py-3 px-6 border border-gray-200 bg-white"
        >
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1 py-3 px-6">
          Next
        </Button>
      </div>
    </div>
  );
}
