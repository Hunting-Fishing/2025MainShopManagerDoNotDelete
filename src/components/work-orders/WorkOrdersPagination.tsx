
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface WorkOrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function WorkOrdersPagination({
  currentPage,
  totalPages,
  onPageChange,
}: WorkOrdersPaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageItems = 5; // Maximum number of page numbers to show
    
    // Calculate the range of pages to display
    let startPage = Math.max(1, currentPage - Math.floor(maxPageItems / 2));
    let endPage = startPage + maxPageItems - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageItems + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {/* Page numbers */}
        {pageNumbers.map((number) => (
          <PaginationItem key={number}>
            <PaginationLink
              isActive={currentPage === number}
              onClick={() => onPageChange(number)}
              className="cursor-pointer"
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        {/* Next button */}
        <PaginationItem>
          <PaginationNext
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
