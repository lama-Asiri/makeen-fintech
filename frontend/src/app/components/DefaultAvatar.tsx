interface DefaultAvatarProps {
  displayName: string;
  size?: number;
  className?: string;
}

export function DefaultAvatar({ displayName, size = 40, className = '' }: DefaultAvatarProps) {
  // Get first letter of display name, uppercase
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div
      className={`rounded-full flex items-center justify-center bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] border border-[rgba(255,252,254,0.15)] ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="font-['Roboto:Medium',sans-serif] font-medium text-[#fffcfe] select-none"
        style={{ fontSize: size * 0.45 }}
      >
        {initial}
      </span>
    </div>
  );
}
