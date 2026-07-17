import { useTranslation } from "react-i18next";

export default function SocialLinkInput({
    platforms,
    selectedPlatform,
    input,
    onPlatformChange,
    onInputChange,
    onAdd,
    disabled,
  }) {
    const { t } = useTranslation("common");
    return (
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select
          value={selectedPlatform}
          onChange={onPlatformChange}
          className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="" disabled>{t("socialChoosePlatform") || "Choose platform"}</option>
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input
          type="text"
          value={input}
          onChange={onInputChange}
          placeholder={t("socialUsernameOrLink") || "Username or Link"}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          onClick={onAdd}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg font-medium ${
            !disabled ? 'bg-pink-500 text-white hover:bg-pink-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t("socialAdd") || "Add"}
        </button>
      </div>
    );
  }
  