/**
 * Pagination component
 * Responsive: stacks on mobile, inline on desktop. Hides extra page numbers on small screens.
 */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const btnBase =
    "min-w-[36px] h-9 flex items-center justify-center px-3 border rounded-lg text-sm font-medium transition-colors";
  const btnDefault =
    "border-gray-300 bg-white text-gray-700 hover:bg-gray-50";
  const btnActive =
    "border-gp-blue bg-gp-blue text-white";
  const btnDisabled =
    "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50 gap-3">
      <div className="text-sm text-gray-600">
        Showing {start}–{end} of {totalItems}
      </div>
      <div className="flex gap-1">
        {/* Previous */}
        <button
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnDefault}`}
          disabled={currentPage === 1}
          onClick={() => onPageChange?.(currentPage - 1)}
        >
          ‹
        </button>

        {/* Page numbers */}
        {getPages().map((page, i) =>
          page === "..." ? (
            <button
              key={`dots-${i}`}
              className={`${btnBase} ${btnDefault} hidden sm:flex`}
              disabled
            >
              ...
            </button>
          ) : (
            <button
              key={page}
              className={`${btnBase} ${
                page === currentPage ? btnActive : btnDefault
              } ${
                // Hide middle pages on very small screens
                page !== currentPage && page !== 1 && page !== totalPages
                  ? "hidden sm:flex"
                  : ""
              }`}
              onClick={() => onPageChange?.(page as number)}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnDefault}`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}