/**
 * Avatar components for consistent initials-based avatars
 * Used across: Dashboard, Club Profile, Grant-Clubs
 */

// Club avatar: square rounded, blue-light bg with initials
export function ClubAvatar({
  initials,
  size = "default",
}: {
  initials: string;
  size?: "sm" | "default" | "lg";
}) {
  const sizes = {
    sm: "w-8 h-8 text-[0.6875rem] rounded-md",
    default: "w-10 h-10 text-[0.8125rem] rounded-lg",
    lg: "w-[72px] h-[72px] text-xl rounded-xl",
  };

  return (
    <div
      className={`${sizes[size]} bg-gp-blue-light flex items-center justify-center text-gp-blue font-bold shrink-0`}
    >
      {initials}
    </div>
  );
}

// User avatar: circular, colored bg with initials (for AE, staff, etc.)
export function UserAvatar({
  initials,
  color = "#1E88E5",
  size = "default",
}: {
  initials: string;
  color?: string;
  size?: "sm" | "default" | "lg";
}) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    default: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

// Account Executive cell: avatar + name inline
export function AECell({
  name,
  initials,
  color,
}: {
  name: string;
  initials: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar initials={initials} color={color} size="sm" />
      <span className="text-sm whitespace-nowrap">{name}</span>
    </div>
  );
}