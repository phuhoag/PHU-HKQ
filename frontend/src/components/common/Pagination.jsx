import { MdChevronLeft, MdChevronRight } from "react-icons/md";

export default function Pagination({
  currentPage = 1,
  totalPages = 12,
  onPageChange,
}) {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (currentPage > 1) pages.push("prev");

    // Show first page
    if (currentPage > 2) {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
    }

    // Show pages around current
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) pages.push(i);
    }

    // Show last page
    if (currentPage < totalPages - 1) {
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    if (currentPage < totalPages) pages.push("next");
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-stack-lg flex items-center justify-center gap-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MdChevronLeft size={20} />
      </button>

      {pages.map((page, index) => (
        <div key={index}>
          {page === "..." ? (
            <span className="mx-2 text-on-surface-variant">...</span>
          ) : page === "prev" ? null : page === "next" ? null : (
            <button
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                page === currentPage
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant hover:bg-surface-container-high"
              }`}
            >
              {page}
            </button>
          )}
        </div>
      ))}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MdChevronRight size={20} />
      </button>
    </div>
  );
}
