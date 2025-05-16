
import { DateRange } from "react-day-picker";

export interface CustomerFilters {
  searchQuery?: string;
  tags?: string[];
  vehicleType?: string;
  hasVehicles?: string;
  dateRange?: DateRange;
}
