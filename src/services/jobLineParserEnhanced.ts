
import { WorkOrderJobLine } from '@/types/jobLine';
import { supabase } from '@/integrations/supabase/client';

interface LaborRate {
  id: string;
  rate_type: string;
  hourly_rate: number;
  is_default: boolean;
}

interface ParsedJobLineData {
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimatedHours?: number;
}

// Enhanced parser that fetches real labor rates from the database
export async function parseJobLinesFromDescriptionEnhanced(
  description: string, 
  workOrderId: string,
  shopId?: string
): Promise<WorkOrderJobLine[]> {
  if (!description) return [];

  console.log('Enhanced parsing job lines from description:', description);

  // Fetch real labor rates from the database
  const laborRates = await fetchLaborRates(shopId);
  const defaultRate = laborRates.find(rate => rate.is_default) || laborRates[0];
  
  if (!defaultRate) {
    console.warn('No labor rates found, using fallback rate');
  }

  // Parse the description into job line data
  const parsedLines = parseDescriptionText(description);
  
  // Convert to WorkOrderJobLine format with real rates
  const jobLines: WorkOrderJobLine[] = parsedLines.map((line, index) => ({
    id: `${workOrderId}-job-${index + 1}`,
    workOrderId,
    name: line.name,
    category: line.category,
    subcategory: line.subcategory,
    description: line.description || line.name,
    estimatedHours: line.estimatedHours || 1,
    laborRate: defaultRate?.hourly_rate || 100, // Use real rate or fallback
    totalAmount: (line.estimatedHours || 1) * (defaultRate?.hourly_rate || 100),
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  console.log('Enhanced parsed job lines:', jobLines);
  return jobLines;
}

async function fetchLaborRates(shopId?: string): Promise<LaborRate[]> {
  try {
    let query = supabase
      .from('labor_rates')
      .select('id, rate_type, hourly_rate, is_default');
    
    if (shopId) {
      query = query.eq('shop_id', shopId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching labor rates:', error);
      return [];
    }
    
    console.log('Fetched labor rates:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchLaborRates:', error);
    return [];
  }
}

function parseDescriptionText(description: string): ParsedJobLineData[] {
  const lines: ParsedJobLineData[] = [];
  const text = description.toLowerCase();

  // Enhanced parsing patterns with better time estimates
  const servicePatterns = [
    // Remove & Replace patterns
    { pattern: /r\s*&\s*r\s+radiator/i, name: 'R & R Radiator', category: 'Remove & Replace', hours: 3.0 },
    { pattern: /r\s*&\s*r\s+transmission/i, name: 'R & R Transmission', category: 'Remove & Replace', hours: 8.0 },
    { pattern: /r\s*&\s*r\s+engine/i, name: 'R & R Engine', category: 'Remove & Replace', hours: 12.0 },
    { pattern: /r\s*&\s*r\s+alternator/i, name: 'R & R Alternator', category: 'Remove & Replace', hours: 2.0 },
    { pattern: /r\s*&\s*r\s+starter/i, name: 'R & R Starter', category: 'Remove & Replace', hours: 1.5 },
    { pattern: /r\s*&\s*r\s+battery/i, name: 'R & R Battery', category: 'Remove & Replace', hours: 0.3 },
    { pattern: /r\s*&\s*r\s+water\s+pump/i, name: 'R & R Water Pump', category: 'Remove & Replace', hours: 4.0 },
    { pattern: /r\s*&\s*r\s+thermostat/i, name: 'R & R Thermostat', category: 'Remove & Replace', hours: 1.0 },
    { pattern: /r\s*&\s*r\s+brake\s+pads/i, name: 'R & R Brake Pads', category: 'Remove & Replace', hours: 1.5 },
    { pattern: /r\s*&\s*r\s+brake\s+rotors/i, name: 'R & R Brake Rotors', category: 'Remove & Replace', hours: 2.0 },
    
    // Repair patterns
    { pattern: /repair\s+radiator/i, name: 'Radiator Repair', category: 'Repair', hours: 2.5 },
    { pattern: /repair\s+transmission/i, name: 'Transmission Repair', category: 'Repair', hours: 6.0 },
    { pattern: /repair\s+engine/i, name: 'Engine Repair', category: 'Repair', hours: 8.0 },
    { pattern: /repair\s+exhaust/i, name: 'Exhaust Repair', category: 'Repair', hours: 2.0 },
    { pattern: /repair\s+suspension/i, name: 'Suspension Repair', category: 'Repair', hours: 3.0 },
    
    // Service patterns
    { pattern: /oil\s+change/i, name: 'Oil Change', category: 'Service', hours: 0.5 },
    { pattern: /tire\s+rotation/i, name: 'Tire Rotation', category: 'Service', hours: 0.5 },
    { pattern: /wheel\s+alignment/i, name: 'Wheel Alignment', category: 'Service', hours: 1.0 },
    { pattern: /brake\s+service/i, name: 'Brake Service', category: 'Service', hours: 2.0 },
    { pattern: /tune\s*up/i, name: 'Tune-Up', category: 'Service', hours: 3.0 },
    { pattern: /transmission\s+service/i, name: 'Transmission Service', category: 'Service', hours: 1.5 },
    { pattern: /coolant\s+flush/i, name: 'Coolant Flush', category: 'Service', hours: 1.0 },
    { pattern: /brake\s+flush/i, name: 'Brake Flush', category: 'Service', hours: 1.0 },
    
    // Inspection patterns
    { pattern: /safety\s+inspection/i, name: 'Safety Inspection', category: 'Inspection', hours: 1.0 },
    { pattern: /emissions?\s+test/i, name: 'Emissions Test', category: 'Inspection', hours: 0.5 },
    { pattern: /pre\s*purchase\s+inspection/i, name: 'Pre-Purchase Inspection', category: 'Inspection', hours: 2.0 },
    { pattern: /diagnostic/i, name: 'Vehicle Diagnostic', category: 'Diagnostic', hours: 1.0 },
    
    // General patterns
    { pattern: /install/i, name: 'Installation Service', category: 'Installation', hours: 2.0 },
    { pattern: /replace/i, name: 'Replacement Service', category: 'Replacement', hours: 2.0 },
    { pattern: /check/i, name: 'System Check', category: 'Inspection', hours: 0.5 },
    { pattern: /flush/i, name: 'Fluid Flush', category: 'Service', hours: 1.0 }
  ];

  // Find all matching patterns
  for (const pattern of servicePatterns) {
    if (pattern.pattern.test(text)) {
      lines.push({
        name: pattern.name,
        category: pattern.category,
        description: `${pattern.name} service as described in work order`,
        estimatedHours: pattern.hours
      });
    }
  }

  // If no specific patterns found, create a general service entry
  if (lines.length === 0) {
    lines.push({
      name: 'General Service',
      category: 'Service',
      description: description.trim(),
      estimatedHours: 2.0
    });
  }

  return lines;
}

// Function to save job lines to database
export async function saveJobLinesToDatabase(
  workOrderId: string, 
  jobLines: WorkOrderJobLine[]
): Promise<boolean> {
  try {
    // First, delete existing job lines for this work order
    await supabase
      .from('work_order_job_lines')
      .delete()
      .eq('work_order_id', workOrderId);

    // Then insert the new job lines
    const jobLinesData = jobLines.map((line, index) => ({
      work_order_id: workOrderId,
      name: line.name,
      category: line.category,
      subcategory: line.subcategory,
      description: line.description,
      estimated_hours: line.estimatedHours,
      labor_rate: line.laborRate,
      total_amount: line.totalAmount,
      status: line.status,
      notes: line.notes,
      display_order: index
    }));

    const { error } = await supabase
      .from('work_order_job_lines')
      .insert(jobLinesData);

    if (error) {
      console.error('Error saving job lines:', error);
      return false;
    }

    console.log('Job lines saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveJobLinesToDatabase:', error);
    return false;
  }
}

// Function to load job lines from database
export async function loadJobLinesFromDatabase(
  workOrderId: string
): Promise<WorkOrderJobLine[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('display_order');

    if (error) {
      console.error('Error loading job lines:', error);
      return [];
    }

    const jobLines: WorkOrderJobLine[] = (data || []).map(line => ({
      id: line.id,
      workOrderId: line.work_order_id,
      name: line.name,
      category: line.category,
      subcategory: line.subcategory,
      description: line.description,
      estimatedHours: line.estimated_hours,
      laborRate: line.labor_rate,
      totalAmount: line.total_amount,
      status: line.status as any,
      notes: line.notes,
      createdAt: line.created_at,
      updatedAt: line.updated_at
    }));

    console.log('Loaded job lines from database:', jobLines);
    return jobLines;
  } catch (error) {
    console.error('Error in loadJobLinesFromDatabase:', error);
    return [];
  }
}
