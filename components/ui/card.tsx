/**
 * Card component - consistent white container used everywhere
 * Supports optional header with title + actions, and footer
 */

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 gap-3">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {actions && (
        <div className="flex gap-3 w-full sm:w-auto">{actions}</div>
      )}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={noPadding ? className : `px-4 md:px-6 py-4 md:py-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}
    >
      {children}
    </div>
  );
}