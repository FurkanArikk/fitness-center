import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  current = 1,
  total = 0,
  pageSize = 10,
  onChange = () => {},
  showSizeChanger = false,
  className = "",
}) => {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          current - 1,
          current,
          current + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* Previous Button */}
      <button
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
          current === 1
            ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
            : "text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
        }`}
        onClick={() => handlePageChange(current - 1)}
        disabled={current === 1}
      >
        <ChevronLeft size={16} className="mr-1" />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            ) : (
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  current === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
          current === totalPages
            ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
            : "text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
        }`}
        onClick={() => handlePageChange(current + 1)}
        disabled={current === totalPages}
      >
        Next
        <ChevronRight size={16} className="ml-1" />
      </button>
    </div>
  );
};

export default Pagination;
