
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkOrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const WorkOrdersPagination: React.FC<WorkOrdersPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="flex justify-between items-center mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
      </Button>
      <div className="text-sm">
        Page {currentPage} of {totalPages || 1}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default WorkOrdersPagination;
