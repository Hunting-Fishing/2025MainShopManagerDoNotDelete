
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageNumbers.map((number) => (
        <Button
          key={number}
          variant={currentPage === number ? "default" : "outline"}
          size="sm"
          className={`h-8 w-8 ${currentPage === number ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
          onClick={() => onPageChange(number)}
        >
          {number}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
