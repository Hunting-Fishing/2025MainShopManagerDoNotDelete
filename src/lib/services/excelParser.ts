
import { read, utils } from 'xlsx';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface ParsedExcelData {
  categories: ServiceMainCategory[];
  stats: {
    totalCategories: number;
    totalSubcategories: number;
    totalJobs: number;
  };
}

export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
  console.log('Starting Excel file parsing...');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Failed to read file data');
        }

        console.log('File loaded, parsing workbook...');
        const workbook = read(data, { type: 'array' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('No sheets found in the Excel file');
        }

        console.log(`Found ${workbook.SheetNames.length} sheets in workbook`);
        
        const categories: ServiceMainCategory[] = [];
        let totalSubcategories = 0;
        let totalJobs = 0;

        // Process each sheet (category)
        for (let i = 0; i < workbook.SheetNames.length; i++) {
          const sheetName = workbook.SheetNames[i];
          console.log(`Processing sheet ${i + 1}/${workbook.SheetNames.length}: ${sheetName}`);
          
          try {
            const category = await parseSheetAsCategory(workbook, sheetName, i);
            if (category) {
              categories.push(category);
              totalSubcategories += category.subcategories.length;
              totalJobs += category.subcategories.reduce((sum, sub) => sum + sub.jobs.length, 0);
            }
          } catch (sheetError) {
            console.warn(`Error processing sheet "${sheetName}":`, sheetError);
            // Continue with other sheets instead of failing completely
          }

          // Add a small delay to prevent blocking
          if (i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }

        if (categories.length === 0) {
          throw new Error('No valid categories could be parsed from the Excel file');
        }

        console.log(`Parsing completed: ${categories.length} categories, ${totalSubcategories} subcategories, ${totalJobs} jobs`);

        resolve({
          categories,
          stats: {
            totalCategories: categories.length,
            totalSubcategories,
            totalJobs
          }
        });
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

async function parseSheetAsCategory(workbook: any, sheetName: string, position: number): Promise<ServiceMainCategory | null> {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`Sheet "${sheetName}" not found`);
    return null;
  }

  // Convert sheet to JSON with header row
  const jsonData = utils.sheet_to_json(sheet, { 
    header: 1, 
    defval: '',
    raw: false 
  }) as string[][];

  if (jsonData.length < 2) {
    console.warn(`Sheet "${sheetName}" has insufficient data (needs at least 2 rows)`);
    return null;
  }

  // First row contains subcategory headers starting from column B (index 1)
  const headerRow = jsonData[0];
  const subcategoryNames = headerRow.slice(1).filter(name => name && name.trim() !== '');

  if (subcategoryNames.length === 0) {
    console.warn(`Sheet "${sheetName}" has no valid subcategory headers`);
    return null;
  }

  console.log(`Found ${subcategoryNames.length} subcategories in "${sheetName}"`);

  // Create subcategories with their jobs
  const subcategories: ServiceSubcategory[] = [];

  for (let colIndex = 0; colIndex < subcategoryNames.length; colIndex++) {
    const subcategoryName = subcategoryNames[colIndex].trim();
    const jobs: ServiceJob[] = [];

    // Collect jobs from this column (starting from row 2)
    for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
      const row = jsonData[rowIndex];
      const jobName = row[colIndex + 1]; // +1 because subcategories start from column B

      if (jobName && jobName.trim() !== '') {
        jobs.push({
          id: `${sheetName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${subcategoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${jobs.length + 1}`,
          name: jobName.trim(),
          description: `${jobName.trim()} service`
        });
      }
    }

    if (jobs.length > 0) {
      subcategories.push({
        id: `${sheetName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${subcategoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: subcategoryName,
        description: `${subcategoryName} services`,
        jobs
      });
    }
  }

  if (subcategories.length === 0) {
    console.warn(`Sheet "${sheetName}" produced no valid subcategories`);
    return null;
  }

  return {
    id: sheetName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: sheetName,
    description: `${sheetName} services`,
    position: position + 1,
    subcategories
  };
}

export function generateExcelTemplate(): void {
  console.log('Generating Excel template...');
  
  const workbook = utils.book_new();

  // Sample categories with their subcategories and jobs
  const sampleData = [
    {
      category: 'Oil Change & Maintenance',
      subcategories: {
        'Oil Changes': [
          'Standard Oil Change',
          'Synthetic Oil Change', 
          'High Mileage Oil Change',
          'Diesel Oil Change'
        ],
        'Filter Services': [
          'Air Filter Replacement',
          'Cabin Filter Replacement',
          'Fuel Filter Replacement',
          'Oil Filter Replacement'
        ],
        'Fluid Services': [
          'Transmission Fluid Change',
          'Coolant Flush',
          'Brake Fluid Change',
          'Power Steering Fluid'
        ]
      }
    },
    {
      category: 'Brakes',
      subcategories: {
        'Brake Pads': [
          'Front Brake Pad Replacement',
          'Rear Brake Pad Replacement',
          'Brake Pad Inspection'
        ],
        'Brake Rotors': [
          'Front Rotor Replacement',
          'Rear Rotor Replacement',
          'Rotor Resurfacing'
        ],
        'Brake System': [
          'Brake Fluid Flush',
          'Brake Line Repair',
          'Brake Caliper Service'
        ]
      }
    },
    {
      category: 'Tires',
      subcategories: {
        'Tire Installation': [
          'Tire Mount & Balance',
          'Tire Rotation',
          'Tire Repair'
        ],
        'Wheel Services': [
          'Wheel Alignment',
          'Wheel Balancing',
          'Wheel Repair'
        ]
      }
    }
  ];

  sampleData.forEach(categoryData => {
    const subcategoryNames = Object.keys(categoryData.subcategories);
    const maxJobs = Math.max(...Object.values(categoryData.subcategories).map(jobs => jobs.length));
    
    // Create sheet data
    const sheetData: string[][] = [];
    
    // Header row with subcategory names starting from column B
    const headerRow = ['', ...subcategoryNames];
    sheetData.push(headerRow);
    
    // Job rows
    for (let i = 0; i < maxJobs; i++) {
      const row = [''];
      subcategoryNames.forEach(subcatName => {
        const jobs = categoryData.subcategories[subcatName as keyof typeof categoryData.subcategories];
        row.push(jobs[i] || '');
      });
      sheetData.push(row);
    }
    
    // Create worksheet
    const worksheet = utils.aoa_to_sheet(sheetData);
    utils.book_append_sheet(workbook, worksheet, categoryData.category);
  });

  // Generate and download the file
  const excelBuffer = utils.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'service_categories_template.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('Template download initiated');
}
