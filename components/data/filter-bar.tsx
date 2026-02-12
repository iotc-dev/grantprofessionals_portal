/**
 * FilterBar - configurable filter dropdowns + search input
 * Responsive: stacks vertically on mobile, horizontal on desktop
 * Used on: Dashboard, Grant-Clubs, Invoices
 */

"use client";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  key: string;
  placeholder: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: FilterConfig[];
  searchPlaceholder?: string;
  onFilterChange?: (key: string, value: string) => void;
  onSearchChange?: (value: string) => void;
  onClear?: () => void;
}

export function FilterBar({
  filters,
  searchPlaceholder = "Search...",
  onFilterChange,
  onSearchChange,
  onClear,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-b border-gray-200 items-stretch md:items-center">
      {filters.map((filter) => (
        <select
          key={filter.key}
          className="px-3 py-2 pr-8 border border-gray-300 rounded-lg text-[0.8125rem] font-medium bg-white appearance-none cursor-pointer w-full md:w-auto focus:outline-none focus:border-gp-blue focus:ring-2 focus:ring-gp-blue/15"
          onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
        >
          <option value="">{filter.placeholder}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
      <input
        type="text"
        placeholder={searchPlaceholder}
        className="px-3 py-2 border border-gray-300 rounded-lg text-[0.8125rem] bg-white w-full md:min-w-[200px] focus:outline-none focus:border-gp-blue focus:ring-2 focus:ring-gp-blue/15"
        onChange={(e) => onSearchChange?.(e.target.value)}
      />
      <div className="hidden md:block flex-1" />
      <button
        className="text-[0.8125rem] font-medium text-gray-500 hover:text-gray-700 transition-colors mt-1 md:mt-0"
        onClick={onClear}
      >
        Clear filters
      </button>
    </div>
  );
}