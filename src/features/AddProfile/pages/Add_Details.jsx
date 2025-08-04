import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '../../../components/Ui/Spinner';

// Lazy load components
const Step1BasicInfo = lazy(() => import('./ProfileWizard/Step1BasicInfo'));
const Step2Bio = lazy(() => import('./ProfileWizard/Step2Bio'));
const Step3PhotoUpload = lazy(() => import('./ProfileWizard/Step3PhotoUpload.'));
const Step4Tags = lazy(() => import('./ProfileWizard/Step4Tags'));

const AddDetails = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route index element={<Navigate to="basic" replace />} />
            <Route path="basic" element={<Step1BasicInfo />} />
            <Route path="bio" element={<Step2Bio />} />
            <Route path="photo" element={<Step3PhotoUpload />} />
            <Route path="tags" element={<Step4Tags />} />
            <Route path="*" element={<Navigate to="basic" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default AddDetails;
