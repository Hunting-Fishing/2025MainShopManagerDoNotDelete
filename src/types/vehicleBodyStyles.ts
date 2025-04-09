
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
