import React, { useState, useEffect, Fragment } from "react";
import { useWizard } from "../../contexts/ProfileWizard";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./Progess";
import { Button } from "../../../../shared/Button";
import { statusOptions } from "../../utlis";
import useLanguages from "../../hooks/useLanguages";
import LanguagePicker from "../../components/LanguagePicker";
import { Listbox, Transition } from "@headlessui/react";

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
        languagesList.filter((l) =>
          formData.languagesKnown.includes(l.value)
        )
      );
    }
  }, [languagesList]);

  const isBioValid =
    typeof formData.bio === "string" &&
    formData.bio.trim().length > 0;

  const handleNext = () => {
    if (!isBioValid) return;
setFormData(p => ({
  languagesKnown: selectedLanguages.map(l => l.value),
  healthStatus: { ...healthStatusFromForm }
}));


    navigate("/complete/photo");
  };

  const selectedStatus = statusOptions.find(
    (s) => s.value === healthStatusFromForm.stdStatus
  );

  return (
    <div className="max-w-xl mx-auto p-4 space-y-8 animate-fade-in">
      <ProgressBar step={3} totalSteps={5} />

      {/* Bio */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">
          Your Story
        </h2>

        <textarea
          value={formData.bio || ""}
          onChange={(e) =>
         setFormData(p => ({
  bio: e.target.value.slice(0, charLimit)
}))

          }
          placeholder="I'm passionate about..."
          className="w-full p-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500 min-h-[160px]"
        />

        <div className="flex justify-between text-sm">
          {!isBioValid && (
            <span className="text-gray-400">
              Bio is required to continue
            </span>
          )}
          <span className="text-gray-400 ml-auto">
            {formData.bio?.length || 0}/{charLimit}
          </span>
        </div>
      </div>

      {/* Languages */}
      <div>
        <h3 className="mb-2 font-semibold">
          Languages You Know (optional)
        </h3>

        <LanguagePicker
          languagesList={languagesList}
          loading={languagesLoading}
          error={languagesError}
          selected={selectedLanguages}
          onChange={setSelectedLanguages}
        />
      </div>

      {/* STD Status — Headless UI */}
      <div className="space-y-1">
        <h3 className="font-semibold">
          STD Status (optional)
        </h3>

        <Listbox
          value={healthStatusFromForm.stdStatus}
          onChange={(value) =>
           setFormData(p => ({
  healthStatus: {
    ...(p.healthStatus || {}),
    stdStatus: value
  }
}))

          }
        >
          <div className="relative mt-1">
            <Listbox.Button className="w-full p-3 bg-white border border-gray-300 rounded-xl text-left focus:ring-2 focus:ring-pink-500">
              {selectedStatus?.label || "Prefer not to say"}
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200">
                <Listbox.Option
                  value=""
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  Prefer not to say
                </Listbox.Option>

                {statusOptions.map(({ label, value }) => (
                  <Listbox.Option
                    key={value}
                    value={value}
                    className={({ active }) =>
                      `cursor-pointer px-4 py-2 ${
                        active ? "bg-pink-50" : ""
                      }`
                    }
                  >
                    {label}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      {/* Last Tested Date */}
      <div className="space-y-1">
        <h3 className="font-semibold">
          Last Tested Date (optional)
        </h3>

        <input
          type="date"
          value={healthStatusFromForm.lastTestedDate}
          onChange={(e) =>
          setFormData(p => ({
  healthStatus: {
    ...(p.healthStatus || {}),
    lastTestedDate: e.target.value
  }
}))

          }
          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
       <Button
  onClick={() => navigate("/complete/location")}
  textColor="black"
  className="
    flex-1 py-3 px-6 border border-gray-200 bg-white
    transition-all duration-150
    hover:bg-gray-50
    active:scale-95
  "
>
  Back
</Button>


     <Button
  onClick={handleNext}
  disabled={!isBioValid}
  className={`flex-1 py-3 px-6 transition-all duration-150 ${
    !isBioValid
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer hover:bg-pink-600 active:scale-95"
  }`}
>
  Next
</Button>

      </div>
    </div>
  );
}
