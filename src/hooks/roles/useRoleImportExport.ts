
import { Role } from "@/types/team";
import { saveAs } from "file-saver";
import { toast } from "sonner";

export function useRoleImportExport(roles: Role[], setRoles: (roles: Role[]) => void) {
  const handleExportRoles = () => {
    try {
      const exportData = JSON.stringify(roles, null, 2);
      const blob = new Blob([exportData], { type: "application/json" });
      saveAs(blob, `role-definitions-${new Date().toISOString().slice(0, 10)}.json`);
      toast.success("Roles exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Error exporting roles");
    }
  };
  
  const handleImportRoles = (importedRoles: Role[]) => {
    try {
      // Validate imported roles have required properties
      const validRoles = importedRoles.filter(role => {
        return role.id && role.name && typeof role.permissions === 'object';
      });
      
      if (validRoles.length === 0) {
        toast.error("No valid roles found in import file");
        return;
      }
      
      // Merge with existing roles, avoiding duplicates by ID
      const existingIds = new Set(roles.map(role => role.id));
      const newRoles = validRoles.filter(role => !existingIds.has(role.id));
      
      if (newRoles.length === 0) {
        toast.error("All imported roles already exist");
        return;
      }
      
      setRoles([...roles, ...newRoles]);
      toast.success(`Imported ${newRoles.length} roles successfully`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Error importing roles");
    }
  };
  
  return {
    handleExportRoles,
    handleImportRoles
  };
}
