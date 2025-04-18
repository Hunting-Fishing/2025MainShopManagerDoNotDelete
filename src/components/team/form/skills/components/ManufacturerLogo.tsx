
import React from 'react';
import { Car } from 'lucide-react';
import 'car-makes-icons/dist/style.css';

// Define the type for the car-makes-icons module
interface CarLogos {
  [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Import car logos with proper typing and error handling
let carMakesIcons: CarLogos = {};
try {
  // Dynamic import to avoid TypeScript errors
  carMakesIcons = require('car-makes-icons');
  console.log('Available car logos:', Object.keys(carMakesIcons));
} catch (error) {
  console.error('Failed to load car-makes-icons:', error);
}

interface ManufacturerLogoProps {
  manufacturer: string;
  className?: string;
}

export const ManufacturerLogo = ({ manufacturer, className = "h-5 w-5" }: ManufacturerLogoProps) => {
  // Normalize the manufacturer name to match the format in car-makes-icons
  const normalizedName = manufacturer.toLowerCase().trim();
  
  // Map of common manufacturer name variants to their standardized names in the car-makes-icons package
  const logoMap: { [key: string]: string } = {
    'vw': 'volkswagen',
    'chevy': 'chevrolet',
    'mercedes': 'mercedesbenz',
    'mercedesbenz': 'mercedesbenz',
    'landrover': 'land-rover',
    'alfa': 'alfaromeo',
    'alfa romeo': 'alfaromeo',
    'aston': 'astonmartin',
    'aston martin': 'astonmartin'
  };
  
  // Get the correct logo name
  const logoName = logoMap[normalizedName] || normalizedName;
  
  // Check if carMakesIcons is properly loaded and contains the logo
  if (Object.keys(carMakesIcons).length > 0) {
    const LogoComponent = carMakesIcons[logoName];
    if (LogoComponent) {
      return (
        <div className={`car-make-icon car-make-icon-${logoName}`}>
          <LogoComponent className={className} />
        </div>
      );
    }
    console.log(`No logo found for ${logoName}`);
  }

  // Fallback to generic car icon
  return <Car className={className} />;
};
