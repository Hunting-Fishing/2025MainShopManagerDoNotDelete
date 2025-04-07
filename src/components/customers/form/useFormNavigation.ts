
import { useState } from "react";

export const useFormNavigation = () => {
  const [currentTab, setCurrentTab] = useState("personal");

  const tabOrder = [
    "personal", 
    "business", 
    "payment",
    "preferences", 
    "vehicles", 
    "household", 
    "segments"
  ];

  const handleNext = () => {
    const currentIndex = tabOrder.indexOf(currentTab);
    
    if (currentIndex < tabOrder.length - 1) {
      setCurrentTab(tabOrder[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabOrder.indexOf(currentTab);
    
    if (currentIndex > 0) {
      setCurrentTab(tabOrder[currentIndex - 1]);
    }
  };

  return {
    currentTab,
    setCurrentTab,
    handleNext,
    handlePrevious
  };
};
