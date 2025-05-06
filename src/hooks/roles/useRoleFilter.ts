
import { useState, useMemo } from "react";
import { Role } from "@/types/team";

export function useRoleFilter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const filterRoles = (roles: Role[]) => {
    return roles.filter(role => {
      // Apply search query filter
      const matchesSearch = 
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply type filter
      const matchesType = 
        typeFilter === "all" ||
        (typeFilter === "default" && role.isDefault) ||
        (typeFilter === "custom" && !role.isDefault);
      
      return matchesSearch && matchesType;
    });
  };
  
  return {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    filterRoles
  };
}
