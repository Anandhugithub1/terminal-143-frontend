import { Routes, Route, Navigate } from 'react-router-dom';
import { WizardProvider } from '../../contexts/ProfileWizard';
import Step1BasicInfo from '../../components/ProfileWizard/Step1BasicInfo';
import Step2Bio from '../../components/ProfileWizard/Step2Bio';
import Step3PhotoUpload from '../../components/ProfileWizard/Step3PhotoUpload';
import Step4Tags from '../../components/ProfileWizard/Step4Tags';
const AddDetails = () => {
  return (
    <WizardProvider>
      <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8">
          <Routes>
            <Route path="/complete/basic" element={<Step1BasicInfo />} />
            <Route path="/complete/bio" element={<Step2Bio />} />
            <Route path="/complete/photo" element={<Step3PhotoUpload />} />
            <Route path="/complete/tags" element={<Step4Tags />} />
            <Route path="/complete-details/*" element={<Navigate to="/complete/basic" />} />
          </Routes>
        </div>
      </div>
    </WizardProvider>
  );
};

export default AddDetails;
