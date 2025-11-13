import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiLock } from "react-icons/fi";
import { fetchProfile } from "../../../features/UserProfile";
import { useProfileByLink } from "../../../Hooks/getProfileByLink";
import ProfileCard from "../../UserHome/components/Cards/ProfileCard";
import placeholderImage from "../../../assets/woman.png";
import { computeAge } from "../../../Utlis/utlis";
import { LoadingSpinner } from "../../../components/Ui/Spinner";
import DetailSection from "../components/PublicProfile/DetailsSection";
import { Button } from "../../../shared/Button";
import PublicTopbar from "../components/PublicProfile/TopBar";
import TopBar from '../../../components/Layout/TopNavigation';
import BottomNav from "../../../components/Layout/BottomNavigation";
import { useProtectedLocks } from '../Hooks/useProtectedLocks';

export default function PublicProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { type, gender, level, username } = useParams();
  const profileLink = `${type}/${gender}/${level}/${username}`;

  const { data, isLoading: isProfileLoading, error: profileError } = useProfileByLink(profileLink);
  const profileFromHook = data?.profile ?? data ?? null;
  const userStatus = useSelector((s) => s.userProfile?.status);

  useEffect(() => {
    if (type !== "mp") {
      navigate("/home", { replace: true });
      return;
    }
    dispatch(fetchProfile());
  }, [type, navigate, dispatch]);

  const hasAccess = userStatus === "succeeded";

  // normalized (small, declarative)
  const src = profileFromHook ?? {};
  const mainPhoto = src.photo ?? src.profilePhoto ?? (Array.isArray(src.photos) ? src.photos[0] : null) ?? placeholderImage;

  const normalized = {
    name: src.name ?? src.username ?? "",
    age: src.dob ? computeAge(src.dob) : 26,
    about: src.bio ?? src.about ?? "",
    images: Array.isArray(src.photos) && src.photos.length ? src.photos : [mainPhoto],
    mainPhoto,
    interests: Array.isArray(src.interests) ? src.interests
                : Array.isArray(src.interest) ? src.interest
                : typeof src.interests === "string" ? [src.interests]
                : typeof src.interest === "string" ? [src.interest]
                : [],
    languages: Array.isArray(src.languages) ? src.languages
               : Array.isArray(src.languagesKnown) ? src.languagesKnown
               : src.language ? [src.language]
               : [],
    location: src.location ?? src.city ?? "",
    job: src.job ?? src.employer ?? "",
    healthStatus: src.healthStatus ?? {},
  };

  // hook provides refs + locks positions
  const { wrapperRef, layerRef, locks } = useProtectedLocks(!hasAccess);

  if (isProfileLoading || userStatus === "loading") return <LoadingSpinner />;
  if (profileError) return <div className="text-center mt-10 text-red-500">{profileError.message}</div>;

  return (
    <div className="relative bg-gray-50 min-h-screen pb-36">
      {/* top bar: show app TopBar for logged-in users, otherwise PublicTopbar */}
      {hasAccess ? <TopBar /> : <PublicTopbar />}

      <div className="relative max-w-2xl mb-6 mx-auto px-4 pt-4">
        <div className="relative">
          <ProfileCard profile={normalized} placeholderImage={placeholderImage} />
        </div>

        {!hasAccess && (
          <div className="mt-5 px-2 mb-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-5">
              <div className="mx-auto w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mb-3">
                <FiLock size={18} color="#ec4899" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Want to see more?</h3>
              <p className="text-sm text-gray-500 max-w-[20rem] mx-auto">
                Sign in or create an account to view the full profile and connect with {normalized.name}.
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 px-2 relative z-0 pb-6">
          <div ref={wrapperRef} className="relative transition-all duration-300">
            <DetailSection profile={normalized} locked={!hasAccess} />
          </div>

          {!hasAccess && (
            <div ref={layerRef} aria-hidden className="absolute inset-0 pointer-events-none z-40">
              {locks.map((lock) => (
                <div
                  key={lock.id}
                  className="absolute flex items-center justify-center"
                  style={{
                    top: `${lock.top}px`,
                    left: `${lock.left}px`,
                    transform: "translate(-50%, -50%)",
                    width: `${lock.width}px`,
                    height: `${lock.height}px`,
                    pointerEvents: "none",
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <FiLock size={20} className="text-gray-500 opacity-80" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA only for non-logged-in users */}
      {!hasAccess && (
        <div className="fixed bottom-4 left-0 right-0 flex items-center justify-center px-4 z-50">
          <div className="w-full max-w-md">
            <Button onClick={() => navigate("/login")}>Sign In to View Profile</Button>

            <div className="mt-3 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="text-primary font-semibold underline-offset-2 hover:underline">
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation for logged-in users */}
      {hasAccess && <BottomNav />}
    </div>
  );
}
