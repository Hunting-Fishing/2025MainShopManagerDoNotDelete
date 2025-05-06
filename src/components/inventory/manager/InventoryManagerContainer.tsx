
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function InventoryManagerContainer() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the inventory settings page
    navigate("/settings/inventory?tab=columns");
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center p-8">
      <p>Redirecting to inventory settings...</p>
    </div>
  );
}
