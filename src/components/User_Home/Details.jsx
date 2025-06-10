import React from "react";
import { RxCross1, RxHeart } from "react-icons/rx";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { AiOutlineReload } from "react-icons/ai";

export function DetailSection({ profile }) {
  const displayStatus =
    profile.stdStatus === "n"
      ? "Negative"
      : profile.stdStatus === "p"
      ? "Positive"
      : "Prefer not to say";

  return (
    <div className="-mt-12 bg-white rounded-t-3xl p-6">
      <div className="flex justify-between items-center">
        {/* <h2 className="text-xl font-semibold">
          {profile.name}, {profile.age}
        </h2> */}
        <div className="flex space-x-3 text-gray-500">
          <button>
            <RxCross1 size={20} />
          </button>
          <button>
            <AiOutlineReload size={20} />
          </button>
          <button>
            <RxHeart size={20} />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <section>
          <h3 className="font-medium">About me</h3>
          <p className="mt-1 text-gray-500">{profile.about}</p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <HiOutlineLocationMarker />
            <span>{profile.location || "Unknown"}</span>
            <span>•</span>
            {/* <span>{profile.job || "—"}</span> */}
          </div>
        </section>

        <section>
          <h3 className="font-medium">Languages</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {profile.languages?.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {lang}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-medium">Interests</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {profile.interests?.map((it) => (
              <span
                key={it}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {it}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-medium">Health Status</h3>
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            <p>
              STI/STD Status: <span className="font-medium">{displayStatus}</span>
            </p>
            <p>
              Tested on: <span className="font-medium">{profile.lastTestedDate || "Unknown"}</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
