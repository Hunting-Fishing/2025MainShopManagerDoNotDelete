
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
      { 
        id: 'hood', 
        name: 'Hood',
        path: 'M120,150 L250,120 L380,150 L380,220 L120,220 Z'
      },
      { 
        id: 'front_bumper', 
        name: 'Front Bumper',
        path: 'M100,220 L120,220 L380,220 L400,220 L400,250 L100,250 Z'
      },
      { 
        id: 'front_left_fender', 
        name: 'Front Left Fender',
        path: 'M120,150 L120,220 L200,220 L220,180 Z'
      },
      { 
        id: 'front_right_fender', 
        name: 'Front Right Fender',
        path: 'M380,150 L380,220 L300,220 L280,180 Z'
      },
      { 
        id: 'front_left_door', 
        name: 'Front Left Door',
        path: 'M200,180 L200,300 L260,300 L260,180 Z'
      },
      { 
        id: 'front_right_door', 
        name: 'Front Right Door',
        path: 'M300,180 L300,300 L240,300 L240,180 Z'
      },
      { 
        id: 'rear_left_door', 
        name: 'Rear Left Door',
        path: 'M260,180 L260,300 L320,300 L320,180 Z'
      },
      { 
        id: 'rear_right_door', 
        name: 'Rear Right Door',
        path: 'M240,180 L240,300 L180,300 L180,180 Z'
      },
      { 
        id: 'trunk', 
        name: 'Trunk',
        path: 'M320,180 L380,180 L380,280 L320,280 Z'
      },
      { 
        id: 'rear_bumper', 
        name: 'Rear Bumper',
        path: 'M100,280 L100,320 L400,320 L400,280 Z'
      },
      { 
        id: 'roof', 
        name: 'Roof',
        path: 'M180,120 L320,120 L320,180 L180,180 Z'
      },
    ]
  },
  hatchback: {
    imagePath: '/lovable-uploads/54ebd323-eaff-40d6-a401-f5a2885d16f6.png',
    altText: 'Hatchback vehicle diagram',
    panels: [
      { 
        id: 'hood', 
        name: 'Hood',
        path: 'M120,150 L250,120 L380,150 L380,200 L120,200 Z'
      },
      { 
        id: 'front_bumper', 
        name: 'Front Bumper',
        path: 'M100,200 L400,200 L400,230 L100,230 Z'
      },
      { 
        id: 'front_left_fender', 
        name: 'Front Left Fender',
        path: 'M120,150 L200,180 L200,230 L120,230 Z'
      },
      { 
        id: 'front_right_fender', 
        name: 'Front Right Fender',
        path: 'M380,150 L300,180 L300,230 L380,230 Z'
      },
      { 
        id: 'front_left_door', 
        name: 'Front Left Door',
        path: 'M180,180 L240,180 L240,280 L180,280 Z'
      },
      { 
        id: 'front_right_door', 
        name: 'Front Right Door',
        path: 'M320,180 L260,180 L260,280 L320,280 Z'
      },
      { 
        id: 'rear_left_door', 
        name: 'Rear Left Door',
        path: 'M240,180 L280,180 L280,260 L240,260 Z'
      },
      { 
        id: 'rear_right_door', 
        name: 'Rear Right Door',
        path: 'M260,180 L220,180 L220,260 L260,260 Z'
      },
      { 
        id: 'hatch', 
        name: 'Hatch',
        path: 'M280,180 L380,180 L380,300 L280,280 Z'
      },
      { 
        id: 'rear_bumper', 
        name: 'Rear Bumper',
        path: 'M100,280 L100,320 L400,320 L400,300 Z'
      },
      { 
        id: 'roof', 
        name: 'Roof',
        path: 'M180,120 L320,120 L320,180 L180,180 Z'
      },
    ]
  },
  suv: {
    imagePath: '/lovable-uploads/053458fd-64a4-4614-a402-abecd5d4da5e.png',
    altText: 'SUV vehicle diagram',
    panels: [
      { 
        id: 'hood', 
        name: 'Hood',
        path: 'M120,150 L250,120 L380,150 L380,200 L120,200 Z'
      },
      { 
        id: 'front_bumper', 
        name: 'Front Bumper',
        path: 'M100,200 L400,200 L400,230 L100,230 Z'
      },
      { 
        id: 'front_left_fender', 
        name: 'Front Left Fender',
        path: 'M120,150 L120,230 L180,230 L180,170 Z'
      },
      { 
        id: 'front_right_fender', 
        name: 'Front Right Fender',
        path: 'M380,150 L380,230 L320,230 L320,170 Z'
      },
      { 
        id: 'front_left_door', 
        name: 'Front Left Door',
        path: 'M180,150 L180,280 L240,280 L240,150 Z'
      },
      { 
        id: 'front_right_door', 
        name: 'Front Right Door',
        path: 'M320,150 L320,280 L260,280 L260,150 Z'
      },
      { 
        id: 'rear_left_door', 
        name: 'Rear Left Door',
        path: 'M240,150 L240,280 L300,280 L300,150 Z'
      },
      { 
        id: 'rear_right_door', 
        name: 'Rear Right Door',
        path: 'M260,150 L260,280 L200,280 L200,150 Z'
      },
      { 
        id: 'rear_gate', 
        name: 'Rear Gate',
        path: 'M300,150 L380,150 L380,280 L300,280 Z'
      },
      { 
        id: 'rear_bumper', 
        name: 'Rear Bumper',
        path: 'M100,280 L400,280 L400,320 L100,320 Z'
      },
      { 
        id: 'roof', 
        name: 'Roof',
        path: 'M180,100 L320,100 L320,150 L180,150 Z'
      },
    ]
  },
  truck: {
    imagePath: '/lovable-uploads/3249a157-242c-40fd-bf9e-3a4bafd54fc9.png',
    altText: 'Truck vehicle diagram',
    panels: [
      { 
        id: 'hood', 
        name: 'Hood',
        path: 'M120,150 L250,120 L380,150 L380,200 L120,200 Z'
      },
      { 
        id: 'front_bumper', 
        name: 'Front Bumper',
        path: 'M100,200 L400,200 L400,230 L100,230 Z'
      },
      { 
        id: 'front_left_fender', 
        name: 'Front Left Fender',
        path: 'M120,150 L120,230 L180,230 L180,170 Z'
      },
      { 
        id: 'front_right_fender', 
        name: 'Front Right Fender',
        path: 'M380,150 L380,230 L320,230 L320,170 Z'
      },
      { 
        id: 'front_left_door', 
        name: 'Front Left Door',
        path: 'M180,150 L180,250 L220,250 L220,150 Z'
      },
      { 
        id: 'front_right_door', 
        name: 'Front Right Door',
        path: 'M320,150 L320,250 L280,250 L280,150 Z'
      },
      { 
        id: 'rear_left_door', 
        name: 'Rear Left Door',
        path: 'M220,150 L220,250 L250,250 L250,150 Z'
      },
      { 
        id: 'rear_right_door', 
        name: 'Rear Right Door',
        path: 'M280,150 L280,250 L250,250 L250,150 Z'
      },
      { 
        id: 'truck_bed', 
        name: 'Truck Bed',
        path: 'M250,180 L380,180 L380,280 L250,280 Z'
      },
      { 
        id: 'tailgate', 
        name: 'Tailgate',
        path: 'M250,280 L380,280 L380,320 L250,320 Z'
      },
      { 
        id: 'rear_bumper', 
        name: 'Rear Bumper',
        path: 'M230,320 L400,320 L400,340 L230,340 Z'
      },
      { 
        id: 'roof', 
        name: 'Roof',
        path: 'M180,120 L320,120 L250,150 L180,150 Z'
      },
    ]
  },
  van: {
    imagePath: '/lovable-uploads/3249a157-242c-40fd-bf9e-3a4bafd54fc9.png', // Using truck image as placeholder
    altText: 'Van vehicle diagram',
    panels: [
      { 
        id: 'hood', 
        name: 'Hood',
        path: 'M120,150 L250,120 L380,150 L380,180 L120,180 Z'
      },
      { 
        id: 'front_bumper', 
        name: 'Front Bumper',
        path: 'M100,180 L400,180 L400,210 L100,210 Z'
      },
      { 
        id: 'front_left_fender', 
        name: 'Front Left Fender',
        path: 'M120,150 L120,210 L160,210 L160,150 Z'
      },
      { 
        id: 'front_right_fender', 
        name: 'Front Right Fender',
        path: 'M380,150 L380,210 L340,210 L340,150 Z'
      },
      { 
        id: 'front_left_door', 
        name: 'Front Left Door',
        path: 'M160,150 L160,280 L220,280 L220,150 Z'
      },
      { 
        id: 'front_right_door', 
        name: 'Front Right Door',
        path: 'M340,150 L340,280 L280,280 L280,150 Z'
      },
      { 
        id: 'side_panel_left', 
        name: 'Left Side Panel',
        path: 'M220,150 L220,280 L300,280 L300,150 Z'
      },
      { 
        id: 'side_panel_right', 
        name: 'Right Side Panel',
        path: 'M280,150 L280,280 L200,280 L200,150 Z'
      },
      { 
        id: 'rear_doors', 
        name: 'Rear Doors',
        path: 'M300,150 L380,150 L380,280 L300,280 Z'
      },
      { 
        id: 'rear_bumper', 
        name: 'Rear Bumper',
        path: 'M100,280 L400,280 L400,320 L100,320 Z'
      },
      { 
        id: 'roof', 
        name: 'Roof',
        path: 'M160,100 L340,100 L340,150 L160,150 Z'
      },
    ]
  },
  unknown: {
    imagePath: '/lovable-uploads/3e5bb843-e896-4fef-8a14-2505536eafaf.png', // Default to sedan
    altText: 'Generic vehicle diagram',
    panels: [
      { 
        id: 'front_bumper', 
        name: 'Front Bumper',
        path: 'M100,220 L400,220 L400,250 L100,250 Z'
      },
      { 
        id: 'hood', 
        name: 'Hood',
        path: 'M120,150 L250,120 L380,150 L380,220 L120,220 Z'
      },
      { 
        id: 'front_left_panel', 
        name: 'Front Left Panel',
        path: 'M120,150 L120,280 L180,280 L180,150 Z'
      },
      { 
        id: 'driver_door', 
        name: 'Driver Door',
        path: 'M180,150 L180,280 L240,280 L240,150 Z'
      },
      { 
        id: 'rear_left_panel', 
        name: 'Rear Left Panel',
        path: 'M240,150 L240,280 L300,280 L300,150 Z'
      },
      { 
        id: 'roof', 
        name: 'Roof',
        path: 'M180,100 L320,100 L320,150 L180,150 Z'
      },
      { 
        id: 'trunk', 
        name: 'Trunk',
        path: 'M300,150 L380,150 L380,280 L300,280 Z'
      },
      { 
        id: 'rear_bumper', 
        name: 'Rear Bumper',
        path: 'M100,280 L400,280 L400,320 L100,320 Z'
      },
      { 
        id: 'rear_right_panel', 
        name: 'Rear Right Panel',
        path: 'M260,150 L260,280 L200,280 L200,150 Z'
      },
      { 
        id: 'passenger_door', 
        name: 'Passenger Door',
        path: 'M320,150 L320,280 L260,280 L260,150 Z'
      },
      { 
        id: 'front_right_panel', 
        name: 'Front Right Panel',
        path: 'M380,150 L380,280 L320,280 L320,150 Z'
      },
      { 
        id: 'windshield', 
        name: 'Windshield',
        path: 'M150,150 L250,120 L350,150 L320,180 L180,180 Z'
      },
      { 
        id: 'rear_window', 
        name: 'Rear Window',
        path: 'M180,180 L320,180 L350,150 L150,150 Z'
      },
    ]
  }
};
