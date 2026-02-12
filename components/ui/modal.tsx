/**
 * StatsCard - the stat boxes on the dashboard
 * Responsive: 1 col mobile, 2 col tablet, 4 col desktop
 */

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {stats.map((stat) => (
        <StatsCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

export function StatsCard({ label, value, icon, iconColor, trend, trendUp }: Stat) {
  return (
    <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor}`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trendUp
                ? "bg-success-light text-success"
                : "bg-danger-light text-danger"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`w-3 h-3 ${trendUp ? "" : "rotate-180"}`}
            >
              <path d="M7 17l5-5 5 5" />
            </svg>
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl md:text-[2rem] font-bold text-gray-900 leading-none mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}