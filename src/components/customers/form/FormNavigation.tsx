
import React from "react";
import { Button } from "@/components/ui/button";
import { CustomerFormActions } from "./CustomerFormActions";

interface FormNavigationProps {
  currentTab: string;
  handlePrevious: () => void;
  handleNext: () => void;
  isSubmitting: boolean;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentTab,
  handlePrevious,
  handleNext,
  isSubmitting,
}) => {
  return (
    <div className="flex justify-between mt-6">
      {currentTab !== "personal" && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={handlePrevious}
        >
          Previous
        </Button>
      )}
      
      <div className="flex-1"></div>
      
      {currentTab !== "vehicles" ? (
        <Button 
          type="button" 
          onClick={handleNext}
        >
          Next
        </Button>
      ) : (
        <CustomerFormActions isSubmitting={isSubmitting} />
      )}
    </div>
  );
};
