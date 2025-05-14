
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const CompanySettings = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to account settings with company tab active
    navigate("/settings/account?tab=company");
  }, [navigate]);
  
  return null; // This component won't render anything as it just redirects
};

export default CompanySettings;
