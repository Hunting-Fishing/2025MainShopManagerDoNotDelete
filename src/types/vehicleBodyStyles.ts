
/**
 * Enum for vehicle body styles used in inspections
 */
export enum VehicleBodyStyle {
  Sedan = 'sedan',
  SUV = 'suv',
  Truck = 'truck',
  Van = 'van',
  Coupe = 'coupe',
  Wagon = 'wagon',
  Convertible = 'convertible',
  Hatchback = 'hatchback',
  Minivan = 'minivan',
  Pickup = 'pickup',
  Other = 'other',
  Unknown = 'unknown' // Added unknown type to handle edge cases
}

// Define panel configurations for each vehicle type
export interface VehiclePanel {
  id: string;
  name: string;
  coordinates?: string;
}

export interface VehicleStyleConfig {
  imagePath: string;
  altText: string;
  panels: VehiclePanel[];
}

// Map of vehicle body styles to their configurations
export const VEHICLE_BODY_STYLES: Record<string, VehicleStyleConfig> = {
  sedan: {
    imagePath: '/lovable-uploads/bd96d9af-12db-494e-8e7f-609805c801a0.png',
    altText: 'Sedan vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'trunk', name: 'Trunk' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'front_left_door', name: 'Left Front Door' },
      { id: 'rear_left_door', name: 'Left Rear Door' },
      { id: 'front_right_door', name: 'Right Front Door' },
      { id: 'rear_right_door', name: 'Right Rear Door' },
      { id: 'front_left_fender', name: 'Left Front Fender' },
      { id: 'front_right_fender', name: 'Right Front Fender' }
    ]
  },
  suv: {
    imagePath: '/lovable-uploads/332913db-cb57-4dbd-b290-3925552a3911.png',
    altText: 'SUV vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'rear_window', name: 'Rear Window' },
      { id: 'trunk', name: 'Cargo Area' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'front_left_door', name: 'Left Front Door' },
      { id: 'rear_left_door', name: 'Left Rear Door' },
      { id: 'front_right_door', name: 'Right Front Door' },
      { id: 'rear_right_door', name: 'Right Rear Door' },
      { id: 'front_left_fender', name: 'Left Front Fender' },
      { id: 'front_right_fender', name: 'Right Front Fender' }
    ]
  },
  hatchback: {
    imagePath: '/lovable-uploads/aa1d5122-b95b-4b2e-9109-0d70e0808da6.png',
    altText: 'Hatchback vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'trunk', name: 'Hatch' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'front_left_door', name: 'Left Front Door' },
      { id: 'rear_left_door', name: 'Left Rear Door' },
      { id: 'front_right_door', name: 'Right Front Door' },
      { id: 'rear_right_door', name: 'Right Rear Door' },
      { id: 'front_left_fender', name: 'Left Front Fender' },
      { id: 'front_right_fender', name: 'Right Front Fender' }
    ]
  },
  truck: {
    imagePath: '/lovable-uploads/57aefd54-8d89-4b93-b523-5bd2474d84af.png',
    altText: 'Truck vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'truck_bed', name: 'Truck Bed' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'front_left_door', name: 'Left Door' },
      { id: 'front_right_door', name: 'Right Door' },
      { id: 'front_left_fender', name: 'Left Front Fender' },
      { id: 'front_right_fender', name: 'Right Front Fender' }
    ]
  },
  van: {
    imagePath: '/lovable-uploads/332913db-cb57-4dbd-b290-3925552a3911.png',
    altText: 'Van vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'rear_window', name: 'Rear Window' },
      { id: 'trunk', name: 'Cargo Area' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'front_left_door', name: 'Left Front Door' },
      { id: 'rear_left_door', name: 'Sliding Door' },
      { id: 'front_right_door', name: 'Right Front Door' },
      { id: 'rear_right_door', name: 'Right Side Panel' },
      { id: 'front_left_fender', name: 'Left Front Fender' },
      { id: 'front_right_fender', name: 'Right Front Fender' }
    ]
  },
  unknown: {
    imagePath: '/lovable-uploads/bd96d9af-12db-494e-8e7f-609805c801a0.png',
    altText: 'Generic vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'trunk', name: 'Trunk/Cargo' },
      { id: 'rear_bumper', name: 'Rear Bumper' }
    ]
  }
};
