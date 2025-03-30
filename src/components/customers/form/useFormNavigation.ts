
import { useState, useCallback } from "react";

export const useFormNavigation = () => {
  const [currentTab, setCurrentTab] = useState("personal");

  const handleNext = useCallback(() => {
    switch (currentTab) {
      case "personal":
        setCurrentTab("business");
        break;
      case "business":
        setCurrentTab("preferences");
        break;
      case "preferences":
        setCurrentTab("referral");
        break;
      case "referral":
        setCurrentTab("vehicles");
        break;
      default:
        break;
    }
  }, [currentTab]);

  const handlePrevious = useCallback(() => {
    switch (currentTab) {
      case "business":
        setCurrentTab("personal");
        break;
      case "preferences":
        setCurrentTab("business");
        break;
      case "referral":
        setCurrentTab("preferences");
        break;
      case "vehicles":
        setCurrentTab("referral");
        break;
      default:
        break;
    }
  }, [currentTab]);

  return {
    currentTab,
    setCurrentTab,
    handleNext,
    handlePrevious
  };
};
