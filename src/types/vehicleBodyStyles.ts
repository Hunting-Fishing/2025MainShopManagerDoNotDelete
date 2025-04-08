
export type VehicleBodyStyle = 'sedan' | 'suv' | 'hatchback' | 'truck' | 'van' | 'unknown';

export interface VehiclePanel {
  id: string;
  name: string;
  path?: string;  // SVG path for the panel
  points?: string; // Polygon points for complex shapes
  viewBox?: string; // Custom viewBox for this panel if needed
}

export interface VehicleBodyStyleConfig {
  imagePath: string;
  altText: string;
  panels: VehiclePanel[];
}

export const VEHICLE_BODY_STYLES: Record<VehicleBodyStyle, VehicleBodyStyleConfig> = {
  sedan: {
    imagePath: '/lovable-uploads/3e5bb843-e896-4fef-8a14-2505536eafaf.png',
    altText: 'Sedan vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'front_left_fender', name: 'Front Left Fender' },
      { id: 'front_right_fender', name: 'Front Right Fender' },
      { id: 'front_left_door', name: 'Front Left Door' },
      { id: 'front_right_door', name: 'Front Right Door' },
      { id: 'rear_left_door', name: 'Rear Left Door' },
      { id: 'rear_right_door', name: 'Rear Right Door' },
      { id: 'trunk', name: 'Trunk' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'roof', name: 'Roof' },
    ]
  },
  hatchback: {
    imagePath: '/lovable-uploads/54ebd323-eaff-40d6-a401-f5a2885d16f6.png',
    altText: 'Hatchback vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'front_left_fender', name: 'Front Left Fender' },
      { id: 'front_right_fender', name: 'Front Right Fender' },
      { id: 'front_left_door', name: 'Front Left Door' },
      { id: 'front_right_door', name: 'Front Right Door' },
      { id: 'rear_left_door', name: 'Rear Left Door' },
      { id: 'rear_right_door', name: 'Rear Right Door' },
      { id: 'hatch', name: 'Hatch' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'roof', name: 'Roof' },
    ]
  },
  suv: {
    imagePath: '/lovable-uploads/053458fd-64a4-4614-a402-abecd5d4da5e.png',
    altText: 'SUV vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'front_left_fender', name: 'Front Left Fender' },
      { id: 'front_right_fender', name: 'Front Right Fender' },
      { id: 'front_left_door', name: 'Front Left Door' },
      { id: 'front_right_door', name: 'Front Right Door' },
      { id: 'rear_left_door', name: 'Rear Left Door' },
      { id: 'rear_right_door', name: 'Rear Right Door' },
      { id: 'rear_gate', name: 'Rear Gate' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'roof', name: 'Roof' },
    ]
  },
  truck: {
    imagePath: '/lovable-uploads/3249a157-242c-40fd-bf9e-3a4bafd54fc9.png',
    altText: 'Truck vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'front_left_fender', name: 'Front Left Fender' },
      { id: 'front_right_fender', name: 'Front Right Fender' },
      { id: 'front_left_door', name: 'Front Left Door' },
      { id: 'front_right_door', name: 'Front Right Door' },
      { id: 'rear_left_door', name: 'Rear Left Door' },
      { id: 'rear_right_door', name: 'Rear Right Door' },
      { id: 'truck_bed', name: 'Truck Bed' },
      { id: 'tailgate', name: 'Tailgate' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'roof', name: 'Roof' },
    ]
  },
  van: {
    imagePath: '/lovable-uploads/3249a157-242c-40fd-bf9e-3a4bafd54fc9.png', // Using truck image as placeholder
    altText: 'Van vehicle diagram',
    panels: [
      { id: 'hood', name: 'Hood' },
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'front_left_fender', name: 'Front Left Fender' },
      { id: 'front_right_fender', name: 'Front Right Fender' },
      { id: 'front_left_door', name: 'Front Left Door' },
      { id: 'front_right_door', name: 'Front Right Door' },
      { id: 'side_panel_left', name: 'Left Side Panel' },
      { id: 'side_panel_right', name: 'Right Side Panel' },
      { id: 'rear_doors', name: 'Rear Doors' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'roof', name: 'Roof' },
    ]
  },
  unknown: {
    imagePath: '/lovable-uploads/3e5bb843-e896-4fef-8a14-2505536eafaf.png', // Default to sedan
    altText: 'Generic vehicle diagram',
    panels: [
      { id: 'front_bumper', name: 'Front Bumper' },
      { id: 'hood', name: 'Hood' },
      { id: 'front_left_panel', name: 'Front Left Panel' },
      { id: 'driver_door', name: 'Driver Door' },
      { id: 'rear_left_panel', name: 'Rear Left Panel' },
      { id: 'roof', name: 'Roof' },
      { id: 'trunk', name: 'Trunk' },
      { id: 'rear_bumper', name: 'Rear Bumper' },
      { id: 'rear_right_panel', name: 'Rear Right Panel' },
      { id: 'passenger_door', name: 'Passenger Door' },
      { id: 'front_right_panel', name: 'Front Right Panel' },
      { id: 'windshield', name: 'Windshield' },
      { id: 'rear_window', name: 'Rear Window' },
    ]
  }
};
