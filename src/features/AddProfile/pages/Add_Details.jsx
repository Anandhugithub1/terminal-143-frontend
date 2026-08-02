import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import NavBar from '../../../components/Layout/Navbar'
// Lazy load components
const Step1BasicInfo = lazy(() => import('./ProfileWizard/BasicInfo'));
const Bio = lazy(() => import('./ProfileWizard/Bio'));
const Photo = lazy(() => import('./ProfileWizard/Photo'));
const Tags = lazy(() => import('./ProfileWizard/Tags'));
const Location =lazy(() => import ('./ProfileWizard/Location'));

// Sized to roughly match a wizard step's real content (not the full-page
// LoadingSpinner, which is min-h-[100dvh] with its own gray background —
// nested inside this card, that made the card balloon to full viewport
// height on every step transition then instantly collapse to the real
// form's height once the lazy chunk resolved: a visible grow-then-shrink
// flash on every "Next". This fallback fills the card at a stable height
// instead of forcing the card itself to resize around it.
const StepLoadingFallback = () => (
  <div className="min-h-[420px] flex items-center justify-center">
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 0.2}s` }}
          className="h-4 w-4 animate-bounce bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-lg"
        />
      ))}
    </div>
  </div>
);

const AddDetails = () => {
  return (
  <>
        <NavBar />

    <div className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-pink-100 to-purple-200 flex items-start justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative">
        <Suspense fallback={<StepLoadingFallback />}>
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
