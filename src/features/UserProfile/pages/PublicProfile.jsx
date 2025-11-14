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
      <div className="relative bg-gray-50 min-h-screen">
        {/* top bar: show app TopBar for logged-in users, otherwise PublicTopbar */}
        {hasAccess ? <TopBar /> : <PublicTopbar />}

        {/* NOTE: when not signed in we add extra bottom padding (pb-40) so CTA never overlaps content */}
        <div className={`relative max-w-2xl mx-auto px-2 pt-2 ${!hasAccess ? 'pb-36 md:pb-44' : 'pb-6'}`}>
          <div className="relative">
            <ProfileCard profile={normalized} placeholderImage={placeholderImage} />
          </div>

          {!hasAccess && (
            <div className="mt-5 px-2 mb-6">
              {/* reduced py on very small screens to avoid giant banner */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-4 md:py-5 px-4">
                <div className="mx-auto w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                  <FiLock size={18}  className="text-primary font-bold" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-1">Want to see more?</h3>
                <p className="text-sm text-gray-500 max-w-[20rem] mx-auto">
                  Sign in or create an account to view the full profile and connect with {normalized.name}.
                </p>
              </div>
            </div>
          )}

          <div className="mt-3 px-2 relative z-0">
            <div ref={wrapperRef} className="relative transition-all duration-300">
              <DetailSection profile={normalized} locked={!hasAccess} />
            </div>

            {/* overlay layer for small locks (positioned above details but inside the content container) */}
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
                
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA only for non-logged-in users. Use safe-area and responsive spacing so it never overlaps the big banner */}
        {!hasAccess && (
          <div
            className="fixed left-0 right-0 flex items-center justify-center px-4 z-50"
            style={{
              bottom: 'env(safe-area-inset-bottom, 16px)',
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
            }}
          >
            <div className="w-full max-w-md">
              <Button onClick={() => navigate("/login")} className="w-full px-4">
                Sign In to View Profile
              </Button>

              <div className="mt-3 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button onClick={() => navigate("/register")} className="text-primary font-semibold underline-offset-2 hover:underline">
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
