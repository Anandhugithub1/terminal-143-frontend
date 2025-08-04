export default function SocialLinkChip({ platform, usernameOrLink, onRemove }) {
    return (
      <span className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
        <strong className="uppercase">{platform}</strong>
        <span className="truncate max-w-[120px]">{usernameOrLink}</span>
        <button onClick={onRemove} className="flex-none text-gray-400 hover:text-red-500">✕</button>
      </span>
    );
  }
  