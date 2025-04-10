import { Routes, Route, Navigate } from 'react-router-dom';
import Step1BasicInfo from '../../components/ProfileWizard/Step1BasicInfo';
import Step2Bio from '../../components/ProfileWizard/Step2Bio';
import Step3PhotoUpload from '../../components/ProfileWizard/Step3PhotoUpload.';
import Step4Tags from '../../components/ProfileWizard/Step4Tags';

const AddDetails = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center px-4 py-8">
      {/* Outer container to hold the wizard card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative">
  
        <Routes>
          {/* When the user hits /complete, redirect to /complete/basic */}
          <Route index element={<Navigate to="basic" replace />} />
          <Route path="basic" element={<Step1BasicInfo />} />
          <Route path="bio" element={<Step2Bio />} />
          <Route path="photo" element={<Step3PhotoUpload />} />
          <Route path="tags" element={<Step4Tags />} />
          {/* Fallback to basic for any other subpath */}
          <Route path="*" element={<Navigate to="basic" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AddDetails;
