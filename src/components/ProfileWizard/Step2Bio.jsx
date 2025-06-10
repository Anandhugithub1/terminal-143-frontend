/* ========== Step2Bio.jsx ========== */
import React from 'react';
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';
import { languageOptions } from '../../Utlis/utlis';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import ReactCountryFlag from 'react-country-flag';

const STD_STATUS = {
  POSITIVE: 'p',
  NEGATIVE: 'n',
  PREFER_NOT_TO_SAY: 'pns',
};

const statusOptions = [
  { label: 'Positive', value: STD_STATUS.POSITIVE },
  { label: 'Negative', value: STD_STATUS.NEGATIVE },
  { label: 'Prefer not to say', value: STD_STATUS.PREFER_NOT_TO_SAY },
];

const Step2Bio = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const charLimit = 500;

  const healthStatus = formData.healthStatus || {
    stdStatus: '',
    lastTestedDate: '',
  };

  const handleNext = () => navigate('/complete/photo');
  const handleBack = () => navigate('/complete/basic');

  const handleLanguagesChange = (selected) => {
    setFormData({ ...formData, languagesKnown: selected });
  };

  const handleStatusChange = (e) => {
    setFormData({
      ...formData,
      healthStatus: {
        ...healthStatus,
        stdStatus: e.target.value,
      },
    });
  };

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      healthStatus: {
        ...healthStatus,
        lastTestedDate: e.target.value,
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <ProgressBar step={2} totalSteps={4} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Story 💬</h2>
        <p className="text-gray-500">What makes you unique?</p>
      </div>

      {/* Bio Field */}
      <div className="relative mb-8">
        <textarea
          value={formData.bio || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              bio: e.target.value.slice(0, charLimit),
            })
          }
          placeholder="I'm passionate about..."
          className="w-full p-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500 resize-none min-h-[160px]"
        />
        <div className="absolute bottom-3 right-3 text-sm text-gray-400">
          {(formData.bio?.length || 0)}/{charLimit}
        </div>
      </div>

      {/* Languages Known */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Languages You Know 🌐</h3>
        <Listbox
          value={formData.languagesKnown || []}
          onChange={handleLanguagesChange}
          multiple
        >
          <div className="relative mt-1">
            <ListboxButton className="relative w-full cursor-default rounded-xl bg-gray-50 py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 sm:text-sm">
              <span className="block truncate">
                {formData.languagesKnown?.length > 0
                  ? languageOptions
                      .filter((opt) =>
                        formData.languagesKnown.includes(opt.value)
                      )
                      .map((opt) => opt.label)
                      .join(', ')
                  : 'Select languages'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>

            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {languageOptions.map(({ label, value, countryCode }) => (
                <ListboxOption
                  key={value}
                  value={value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-pink-100 text-pink-900' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate flex items-center gap-2 ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        <ReactCountryFlag
                          countryCode={countryCode}
                          svg
                          style={{
                            width: '1.5em',
                            height: '1.5em',
                            borderRadius: '50%',
                          }}
                          title={countryCode}
                        />
                        {label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-600">
                          <CheckIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>

      {/* STD Status */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">STD Status 🧬</h3>
        <select
          value={healthStatus.stdStatus}
          onChange={handleStatusChange}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300"
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

      {/* Last Tested Date */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Last Tested Date 🗓️</h3>
        <input
          type="date"
          value={healthStatus.lastTestedDate}
          onChange={handleDateChange}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300"
        />
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2Bio;
