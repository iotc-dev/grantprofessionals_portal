/**
 * DataTable - generic table wrapper with responsive horizontal scroll
 * Handles: column definitions, sorting indicators, row rendering
 * Used on: Dashboard, Grant-Clubs, Invoices
 */

"use client";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  minWidth?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  onSort,
  sortKey,
  sortDir,
  minWidth = "800px",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                  col.sortable
                    ? "cursor-pointer hover:text-gray-700 select-none"
                    : ""
                } ${col.className || ""}`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span
                      className={`text-[0.625rem] ${
                        sortKey === col.key ? "text-gp-blue" : "text-gray-400"
                      }`}
                    >
                      {sortKey === col.key
                        ? sortDir === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-500 text-sm"
              >
                No results found
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 md:px-6 py-4 ${col.className || ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}