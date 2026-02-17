import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '../../../components/Ui/Spinner';
import NavBar from '../../../components/Layout/Navbar'
// Lazy load components
const Step1BasicInfo = lazy(() => import('./ProfileWizard/BasicInfo'));
const Bio = lazy(() => import('./ProfileWizard/Bio'));
const Photo = lazy(() => import('./ProfileWizard/Photo'));
const Tags = lazy(() => import('./ProfileWizard/Tags'));
const Location =lazy(() => import ('./ProfileWizard/Location'));

const AddDetails = () => {
  return (
  <>
        <NavBar />

    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route index element={<Navigate to="basic" replace />} />
            <Route path="basic" element={<Step1BasicInfo />} />
            <Route path="bio" element={<Bio />} />
            <Route path="photo" element={<Photo />} />
            <Route path="tags" element={<Tags />} />
            <Route path='location' element={<Location/>}/>
            <Route path="*" element={<Navigate to="basic" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  </>
  );
};

export default AddDetails;
