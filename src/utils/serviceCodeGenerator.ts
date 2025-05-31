
// Service code generation utilities
export interface ServiceCodeConfig {
  categoryPrefix: string;
  subcategoryCode: string;
  jobSequence: number;
}

// Category prefix mapping for service codes
const CATEGORY_PREFIXES: Record<string, string> = {
  'Engine': 'ENG',
  'Transmission': 'TRN',
  'Brakes': 'BRK',
  'Electrical': 'ELC',
  'Suspension': 'SUS',
  'Exhaust': 'EXH',
  'Cooling': 'COL',
  'Fuel System': 'FUE',
  'Air Conditioning': 'AC',
  'Body & Paint': 'BDY',
  'Interior': 'INT',
  'Tires & Wheels': 'TIR',
  'Diagnostics': 'DIA',
  'Maintenance': 'MNT',
  'Oil Change': 'OIL',
  'Inspection': 'INS'
};

// Subcategory code mapping
const SUBCATEGORY_CODES: Record<string, string> = {
  'Oil & Filters': '01',
  'Spark Plugs': '02',
  'Timing Belt': '03',
  'Brake Pads': '01',
  'Brake Rotors': '02',
  'Brake Fluid': '03',
  'Battery': '01',
  'Alternator': '02',
  'Starter': '03',
  'Shocks': '01',
  'Struts': '02',
  'Alignment': '03'
};

export const generateServiceCode = (
  categoryName: string,
  subcategoryName: string,
  jobIndex: number
): string => {
  const categoryPrefix = CATEGORY_PREFIXES[categoryName] || 'SVC';
  const subcategoryCode = SUBCATEGORY_CODES[subcategoryName] || '99';
  const jobSequence = String(jobIndex + 1).padStart(2, '0');
  
  return `${categoryPrefix}-${subcategoryCode}-${jobSequence}`;
};

export const parseServiceCode = (code: string) => {
  const parts = code.split('-');
  if (parts.length !== 3) return null;
  
  return {
    categoryPrefix: parts[0],
    subcategoryCode: parts[1],
    jobSequence: parts[2]
  };
};
