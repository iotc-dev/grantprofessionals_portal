/**
 * Badge components for consistent status and plan display
 * Used across: Dashboard, Club Profile, Grant-Clubs, Invoices
 */

// Plan badges: GRP (purple), STP (blue), FDP (gold)
export function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    GRP: "bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white",
    STP: "bg-gp-blue text-white",
    FDP: "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[0.6875rem] font-semibold rounded-md uppercase tracking-wide ${
        styles[plan] || "bg-gray-200 text-gray-700"
      }`}
    >
      {plan}
    </span>
  );
}

// Status badges: active (green dot), inactive (gray dot), pending (no dot)
export function StatusBadge({
  status,
  size = "default",
}: {
  status: "active" | "inactive" | "pending" | string;
  size?: "sm" | "default";
}) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[0.625rem]" : "px-3 py-1.5 text-xs";

  const config: Record<string, { bg: string; text: string; dot: string }> = {
    active: {
      bg: "bg-success-light",
      text: "text-success",
      dot: "bg-success",
    },
    inactive: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      dot: "bg-gray-400",
    },
    pending: {
      bg: "bg-warning-light",
      text: "text-warning",
      dot: "bg-warning",
    },
  };

  const c = config[status] || config.inactive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClass} ${c.bg} ${c.text} font-semibold rounded-full`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Alert badge: "3 Pending", "1 Overdue" etc - red background
export function AlertBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-danger-light text-danger text-xs font-semibold rounded-full">
      {text}
    </span>
  );
}

// Invoice status badges
export function InvoiceStatusBadge({
  status,
}: {
  status: "paid" | "sent" | "pending" | "overdue" | string;
}) {
  const config: Record<string, string> = {
    paid: "bg-success-light text-success",
    sent: "bg-gp-blue-light text-gp-blue",
    pending: "bg-warning-light text-warning",
    overdue: "bg-danger-light text-danger",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
        config[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}