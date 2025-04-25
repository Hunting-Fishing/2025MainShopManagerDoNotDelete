
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCompanySettings } from "@/hooks/company-settings/useCompanySettings";
import { useBusinessConstants } from "@/hooks/useBusinessConstants";

// This component is deprecated and redirects to the new location
export function BusinessInfoSection() {
  // Re-export from the new location with the proper type usage
  return <div>This component has moved to src/components/settings/company/BusinessInfoSection.tsx</div>;
}
