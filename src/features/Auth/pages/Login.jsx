import React, { Suspense, lazy } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useNavigate } from 'react-router-dom';
const Footer = lazy(() =>import('../../../components/Layout/Footer'))
const Navbar =lazy(()=>import('../../../components/Layout/Navbar'))

const LoginForm = lazy(() => import('../components/LoginForm'));
import ReviewsSection from "../../../pages/Global/components/Review";
import { demoReviews } from '../../../pages/Global/Review';
 const Login = () => {

  const navigate = useNavigate();
  return (
 <>

 <Suspense fallback={null}>
 <Navbar/>



 </Suspense>
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-purple-200">
      {/* Top spacing for better breathing room */}
      <div className="flex-grow flex items-start justify-center pt-20 sm:pt-28 pb-12 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
        
      </div>

<ReviewsSection
  reviews={demoReviews.slice(0, 3)}
  onMoreClick={() => navigate("/reviews")}
/>
<Suspense fallback={null}>
      <Footer />

</Suspense>

    </div>
 </>
  );
};

const LoginSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Skeleton circle width={50} height={50} />
      </div>
      <Skeleton height={30} width={200} className="mx-auto" />
      <Skeleton height={45} />
      <Skeleton height={45} />
      <Skeleton width={120} height={20} className="ml-auto" />
      <Skeleton height={45} />
      <div className="flex items-center space-x-2 w-full">
        <div className="flex-1"><Skeleton height={1} /></div>
        <Skeleton height={10} width={80} />
        <div className="flex-1"><Skeleton height={1} /></div>
      </div>
      <Skeleton height={20} width={240} className="mx-auto" />
    </div>
  );
};


export default Login;