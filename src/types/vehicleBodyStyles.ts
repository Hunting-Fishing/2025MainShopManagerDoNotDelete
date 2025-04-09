
/**
 * Types of vehicle body styles as defined by automotive industry standards
 */
export type VehicleBodyStyle = 
  | 'sedan'
  | 'hatchback'
  | 'coupe'
  | 'convertible'
  | 'wagon'
  | 'suv'
  | 'crossover'
  | 'minivan'
  | 'van'
  | 'pickup'
  | 'truck'
  | 'bus'
  | 'motorcycle'
  | 'scooter'
  | 'atv'
  | 'rv'
  | 'camper'
  | 'limousine'
  | 'off-road'
  | 'other';

/**
 * Function to convert API body style strings to our standard VehicleBodyStyle type
 */
export const normalizeBodyStyle = (bodyStyle: string): VehicleBodyStyle => {
  const lowerBodyStyle = bodyStyle.toLowerCase();
  
  if (lowerBodyStyle.includes('sedan')) return 'sedan';
  if (lowerBodyStyle.includes('hatchback')) return 'hatchback';
  if (lowerBodyStyle.includes('coupe')) return 'coupe';
  if (lowerBodyStyle.includes('convertible')) return 'convertible';
  if (lowerBodyStyle.includes('wagon')) return 'wagon';
  if (lowerBodyStyle.includes('suv') || lowerBodyStyle.includes('sport utility')) return 'suv';
  if (lowerBodyStyle.includes('crossover')) return 'crossover';
  if (lowerBodyStyle.includes('minivan')) return 'minivan';
  if (lowerBodyStyle.includes('van')) return 'van';
  if (lowerBodyStyle.includes('pickup')) return 'pickup';
  if (lowerBodyStyle.includes('truck')) return 'truck';
  if (lowerBodyStyle.includes('bus')) return 'bus';
  if (lowerBodyStyle.includes('motorcycle')) return 'motorcycle';
  if (lowerBodyStyle.includes('scooter')) return 'scooter';
  if (lowerBodyStyle.includes('atv')) return 'atv';
  if (lowerBodyStyle.includes('rv') || lowerBodyStyle.includes('recreational')) return 'rv';
  if (lowerBodyStyle.includes('camper')) return 'camper';
  if (lowerBodyStyle.includes('limousine')) return 'limousine';
  if (lowerBodyStyle.includes('off-road')) return 'off-road';
  
  return 'other';
};

/**
 * Definition of vehicle body style configuration for the interactive panel
 */
interface VehicleBodyStyleConfig {
  panels: {
    id: string;
    name: string;
  }[];
  imagePath: string;
  altText: string;
}

/**
 * Mapping of vehicle body styles to their configurations
 */
export const VEHICLE_BODY_STYLES: Record<VehicleBodyStyle | string, VehicleBodyStyleConfig> = {
  sedan: {
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'front_left_fender', name: 'Left Front Fender' },
      { id: 'front_right_fender', name: 'Right Front Fender' },
      { id: 'front_left_door', name: 'Left Front Door' },
      { id: 'front_right_door', name: 'Right Front Door' },
      { id: 'rear_left_door', name: 'Left Rear Door' },
      { id: 'rear_right_door', name: 'Right Rear Door' },
      { id: 'trunk', name: 'Trunk' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'rear_window', name: 'Rear Window' }
    ],
    imagePath: '/lovable-uploads/bd96d9af-12db-494e-8e7f-609805c801a0.png',
    altText: 'Sedan vehicle diagram'
  },
  hatchback: {
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'front_left_fender', name: 'Left Front Fender' },
      { id: 'front_right_fender', name: 'Right Front Fender' },
      { id: 'front_left_door', name: 'Left Front Door' },
      { id: 'front_right_door', name: 'Right Front Door' },
      { id: 'rear_left_door', name: 'Left Rear Door' },
      { id: 'rear_right_door', name: 'Right Rear Door' },
      { id: 'trunk', name: 'Hatch' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'rear_window', name: 'Rear Window' }
    ],
    imagePath: '/lovable-uploads/aa1d5122-b95b-4b2e-9109-0d70e0808da6.png',
    altText: 'Hatchback vehicle diagram'
  },
  suv: {
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'front_left_fender', name: 'Left Front Fender' },
      { id: 'front_right_fender', name: 'Right Front Fender' },
      { id: 'front_left_door', name: 'Left Front Door' },
      { id: 'front_right_door', name: 'Right Front Door' },
      { id: 'rear_left_door', name: 'Left Rear Door' },
      { id: 'rear_right_door', name: 'Right Rear Door' },
      { id: 'trunk', name: 'Cargo Area' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'rear_window', name: 'Rear Window' }
    ],
    imagePath: '/lovable-uploads/332913db-cb57-4dbd-b290-3925552a3911.png',
    altText: 'SUV vehicle diagram'
  },
  van: {
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'front_left_fender', name: 'Left Front Fender' },
      { id: 'front_right_fender', name: 'Right Front Fender' },
      { id: 'front_left_door', name: 'Left Front Door' },
      { id: 'front_right_door', name: 'Right Front Door' },
      { id: 'rear_left_door', name: 'Sliding Door' },
      { id: 'rear_right_door', name: 'Right Side Panel' },
      { id: 'trunk', name: 'Cargo Area' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'rear_window', name: 'Rear Window' }
    ],
    imagePath: '/lovable-uploads/332913db-cb57-4dbd-b290-3925552a3911.png',
    altText: 'Van vehicle diagram'
  },
  truck: {
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'front_left_fender', name: 'Left Front Fender' },
      { id: 'front_right_fender', name: 'Right Front Fender' },
      { id: 'front_left_door', name: 'Driver Door' },
      { id: 'front_right_door', name: 'Passenger Door' },
      { id: 'truck_bed', name: 'Truck Bed' },
      { id: 'rear_bumper', name: 'Tailgate' },
    ],
    imagePath: '/lovable-uploads/57aefd54-8d89-4b93-b523-5bd2474d84af.png',
    altText: 'Truck vehicle diagram'
  },
  unknown: {
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'front_left_door', name: 'Left Front Door' },
      { id: 'front_right_door', name: 'Right Front Door' },
      { id: 'trunk', name: 'Trunk/Cargo' },
      { id: 'rear_bumper', name: 'Rear Bumper' }
    ],
    imagePath: '/lovable-uploads/bd96d9af-12db-494e-8e7f-609805c801a0.png',
    altText: 'Generic vehicle diagram'
  },
  other: {
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'roof', name: 'Roof' },
      { id: 'front_left_door', name: 'Left Front Door' },
      { id: 'front_right_door', name: 'Right Front Door' },
      { id: 'trunk', name: 'Trunk/Cargo' },
      { id: 'rear_bumper', name: 'Rear Bumper' }
    ],
    imagePath: '/lovable-uploads/bd96d9af-12db-494e-8e7f-609805c801a0.png',
    altText: 'Generic vehicle diagram'
  }
};
