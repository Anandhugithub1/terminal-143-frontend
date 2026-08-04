import { Copy, Download, Share2 } from "lucide-react";

export default function QRShareCard({ profile, onShare, onCopyLink, onDownload }) {
  const qrCodeSrc = profile?.qrCodeUrl?.startsWith("http")
    ? profile.qrCodeUrl
    : `https://${profile.qrCodeUrl}`;

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
      <img
        src={profile.profilePhoto}
        alt={profile.name}
        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm -mt-1 mb-3"
      />
      <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
      <p className="text-sm text-gray-400 text-center mt-1 mb-6 max-w-xs">
        Anyone who scans this can view your profile and connect with you
      </p>

      <div className="p-4 bg-white rounded-2xl border border-gray-100">
        <img
          src={qrCodeSrc}
          alt="Profile QR code"
          className="w-56 h-56 object-contain bg-gray-50 rounded-xl"
          loading="lazy"
        />
      </div>

      {profile.profileLink && (
        <p className="text-xs text-gray-400 mt-4 text-center break-all max-w-xs">
          {profile.profileLink.replace(/^https?:\/\//, "")}
        </p>
      )}

      <div className="w-full grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          <Download size={16} />
          Download
        </button>
        <button
          onClick={onCopyLink}
          disabled={!profile.profileLink}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Copy size={16} />
          Copy Link
        </button>
      </div>

      <button
        onClick={onShare}
        disabled={!profile.profileLink}
        className="w-full flex items-center justify-center gap-2 mt-3 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        <Share2 size={18} />
        Share Profile
      </button>
    </div>
  );
}
