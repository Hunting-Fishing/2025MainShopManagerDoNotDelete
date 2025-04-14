
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VinDecodeResult, Vehicle, CarMake, CarModel } from '@/types/vehicle';
import { mockVinDatabase } from '@/data/vinDatabase';

/**
 * Decode a Vehicle Identification Number (VIN) to get vehicle details
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  try {
    if (!vin || vin.length !== 17) {
      console.warn("Invalid VIN format or length:", vin);
      return null;
    }
    
    console.log(`Starting VIN decode for: ${vin}`);
    
    // First try to get the VIN from our database if we've seen it before
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vin', vin)
      .maybeSingle();

    if (existingVehicle) {
      console.log("Found existing vehicle in database:", existingVehicle);
      return {
        year: existingVehicle.year,
        make: existingVehicle.make,
        model: existingVehicle.model,
        transmission: existingVehicle.transmission,
        transmission_type: existingVehicle.transmission_type,
        drive_type: existingVehicle.drive_type,
        fuel_type: existingVehicle.fuel_type,
        body_style: existingVehicle.body_style,
        country: existingVehicle.country,
        engine: existingVehicle.engine,
        gvwr: existingVehicle.gvwr,
        trim: existingVehicle.trim
      };
    }

    // Check the database first (exact match)
    const exactVinMatch = mockVinDatabase[vin];
    if (exactVinMatch) {
      console.log(`Found exact match in database for VIN ${vin}:`, exactVinMatch);
      return exactVinMatch;
    }

    // If no exact match, check by prefix - only use the first 8 characters for matching
    console.log("Checking VIN database by prefix for", vin);
    const vinPrefix = vin.substring(0, 8).toUpperCase();
    
    for (const prefix in mockVinDatabase) {
      if (vinPrefix.startsWith(prefix)) {
        console.log(`Found match in database for prefix ${prefix}:`, mockVinDatabase[prefix]);
        return mockVinDatabase[prefix];
      }
    }
    
    // If no match in database, try the edge function
    try {
      console.log("Attempting to use edge function for VIN decoding");
      const { data: decodedData, error } = await supabase.functions.invoke('vin-decoder', {
        body: { vin }
      });

      if (error) {
        console.warn("Edge function error:", error);
        throw new Error(`Edge function failed: ${error.message}`);
      }

      if (decodedData) {
        console.log("Successfully decoded VIN via edge function:", decodedData);
        return decodedData;
      }
    } catch (edgeFunctionError) {
      console.warn("Failed to use edge function, falling back to pattern matching:", edgeFunctionError);
    }

    // Last resort: Basic pattern matching
    console.log("Using basic pattern matching for VIN:", vin);
    
    if (vin.startsWith('1FT') || vin.startsWith('1FA') || vin.startsWith('1FM')) {
      return {
        year: "2020",
        make: "ford",
        model: "Unknown Ford Model",
        transmission: "Automatic",
        fuel_type: "Gas",
        body_style: "unknown"
      };
    } else if (vin.startsWith('1G1') || vin.startsWith('2G1') || vin.startsWith('3G1')) {
      return {
        year: "2020", 
        make: "chevrolet",
        model: "Unknown Chevrolet Model",
        transmission: "Automatic",
        fuel_type: "Gas",
        body_style: "unknown"
      };
    } else if (vin.startsWith('JTD') || vin.startsWith('4T1') || vin.startsWith('5TD')) {
      return {
        year: "2020",
        make: "toyota",
        model: "Unknown Toyota Model",
        transmission: "Automatic",
        fuel_type: "Gas",
        body_style: "unknown"
      };
    }
    
    console.log("No VIN match found in any source");
    return null;
    
  } catch (error) {
    console.error('Error decoding VIN:', error);
    return null;
  }
}

/**
 * Fetches vehicle details by ID from the database
 */
export async function getVehicleById(vehicleId: string): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    toast({
      title: 'Error',
      description: 'Could not fetch vehicle details',
      variant: 'destructive',
    });
    return null;
  }
}

/**
 * Helper function to populate form fields from VIN decoding result
 * This centralizes the logic for setting form fields across the app
 */
export async function populateFormFromVin(
  form: any, 
  vinData: VinDecodeResult, 
  fieldPrefix: string = '', 
  onModelsFetch?: (make: string) => Promise<void>
): Promise<boolean> {
  try {
    if (!vinData) return false;
    
    console.log("Populating form with decoded VIN data:", vinData);
    
    // First set the year - ensure it's a string
    if (vinData.year) {
      form.setValue(`${fieldPrefix}year`, String(vinData.year));
      console.log(`Setting ${fieldPrefix}year:`, vinData.year);
    }
    
    // Then set the make
    if (vinData.make) {
      console.log(`Setting ${fieldPrefix}make to:`, vinData.make);
      form.setValue(`${fieldPrefix}make`, vinData.make);
      
      // Fetch models for this make before setting the model
      if (onModelsFetch) {
        try {
          await onModelsFetch(vinData.make);
          console.log("Models fetched successfully");
          
          // Important delay to ensure models are loaded in component state
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Now set the model after models are loaded
          if (vinData.model) {
            console.log(`Setting ${fieldPrefix}model to:`, vinData.model);
            form.setValue(`${fieldPrefix}model`, vinData.model);
          }
        } catch (err) {
          console.error("Error fetching models:", err);
        }
      } else {
        // No fetch callback provided, set model directly
        if (vinData.model) {
          console.log(`Setting ${fieldPrefix}model directly to:`, vinData.model);
          form.setValue(`${fieldPrefix}model`, vinData.model);
        }
      }
    }
    
    // Set all additional fields if they have values
    const fieldsToSet = [
      { name: 'trim', value: vinData.trim },
      { name: 'transmission', value: vinData.transmission },
      { name: 'transmission_type', value: vinData.transmission_type },
      { name: 'drive_type', value: vinData.drive_type },
      { name: 'fuel_type', value: vinData.fuel_type },
      { name: 'engine', value: vinData.engine },
      { name: 'body_style', value: vinData.body_style },
      { name: 'country', value: vinData.country },
      { name: 'gvwr', value: vinData.gvwr }
    ];
    
    fieldsToSet.forEach(field => {
      if (field.value) {
        console.log(`Setting ${fieldPrefix}${field.name}:`, field.value);
        form.setValue(`${fieldPrefix}${field.name}`, field.value);
      }
    });
    
    // Force a form refresh to ensure values are registered
    const currentValues = form.getValues();
    form.reset({...currentValues}, { keepValues: true });
    
    // Ensure form validation is triggered for make and model fields
    form.trigger([
      `${fieldPrefix}year`,
      `${fieldPrefix}make`, 
      `${fieldPrefix}model`
    ]);
    
    // Log final values for debugging
    console.log("After setting form values - Current make:", form.getValues(`${fieldPrefix}make`));
    console.log("After setting form values - Current model:", form.getValues(`${fieldPrefix}model`));
    
    return true;
  } catch (error) {
    console.error("Error populating form from VIN data:", error);
    return false;
  }
}

/**
 * Formats vehicle information for display
 */
export function formatVehicleInfo(vehicle: Vehicle | null): string {
  if (!vehicle) return 'Unknown Vehicle';
  
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.color ? ` - ${vehicle.color}` : ''}`;
}

/**
 * Gets descriptive text for vehicle transmission type
 */
export function getTransmissionTypeText(type?: string): string {
  if (!type) return 'Unknown';
  
  const transmissionTypes: Record<string, string> = {
    'automatic': 'Automatic',
    'manual': 'Manual',
    'cvt': 'CVT',
    'auto-manual': 'Automated Manual',
    'dual-clutch': 'Dual Clutch',
  };
  
  return transmissionTypes[type.toLowerCase()] || type;
}

/**
 * Gets descriptive text for vehicle fuel type
 */
export function getFuelTypeText(type?: string): string {
  if (!type) return 'Unknown';
  
  const fuelTypes: Record<string, string> = {
    'gasoline': 'Gasoline',
    'diesel': 'Diesel',
    'electric': 'Electric',
    'hybrid': 'Hybrid',
    'plugin_hybrid': 'Plug-in Hybrid',
    'cng': 'CNG',
    'lpg': 'LPG',
  };
  
  return fuelTypes[type.toLowerCase()] || type;
}
