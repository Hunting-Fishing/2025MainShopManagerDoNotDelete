
import { WorkOrderJobLine } from '@/types/jobLine';

interface LaborRateData {
  standard_rate: number;
  diagnostic_rate: number;
  emergency_rate: number;
  warranty_rate: number;
  internal_rate: number;
}

export async function parseJobLinesFromDescriptionEnhanced(
  description: string,
  workOrderId: string,
  shopId?: string
): Promise<WorkOrderJobLine[]> {
  if (!description || description.trim().length === 0) {
    return [];
  }

  // Get labor rates for the shop
  let laborRates: LaborRateData = {
    standard_rate: 100, // Default fallback
    diagnostic_rate: 120,
    emergency_rate: 150,
    warranty_rate: 80,
    internal_rate: 75
  };

  if (shopId) {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: ratesData } = await supabase
        .from('labor_rates')
        .select('standard_rate, diagnostic_rate, emergency_rate, warranty_rate, internal_rate')
        .eq('shop_id', shopId)
        .single();

      if (ratesData) {
        laborRates = ratesData;
      }
    } catch (error) {
      console.error('Error fetching labor rates:', error);
      // Continue with default rates
    }
  }

  const lines = description.split('\n').filter(line => line.trim().length > 0);
  const jobLines: WorkOrderJobLine[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) return;

    // Parse different types of service tasks
    const serviceName = extractServiceName(trimmedLine);
    const category = categorizeService(serviceName);
    const estimatedHours = estimateHours(serviceName, category);
    const laborRateType = determineLaborRateType(category);
    const laborRate = getLaborRate(laborRates, laborRateType);

    const jobLine: WorkOrderJobLine = {
      id: `${workOrderId}-job-${index + 1}`,
      workOrderId,
      name: serviceName,
      category,
      description: trimmedLine !== serviceName ? trimmedLine : undefined,
      estimatedHours,
      laborRate,
      totalAmount: estimatedHours * laborRate,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    jobLines.push(jobLine);
  });

  return jobLines;
}

function extractServiceName(line: string): string {
  // Remove common prefixes and clean up the line
  const cleaned = line
    .replace(/^[-*•]\s*/, '') // Remove bullet points
    .replace(/^\d+\.\s*/, '') // Remove numbered lists
    .replace(/^(check|inspect|replace|repair|service)\s+/i, '') // Remove action verbs
    .trim();

  return cleaned || line.trim();
}

function categorizeService(serviceName: string): string {
  const lower = serviceName.toLowerCase();

  if (lower.includes('oil') || lower.includes('filter') || lower.includes('fluid')) {
    return 'Maintenance';
  }
  if (lower.includes('brake') || lower.includes('rotor') || lower.includes('pad')) {
    return 'Brake Service';
  }
  if (lower.includes('tire') || lower.includes('wheel') || lower.includes('alignment')) {
    return 'Tire Service';
  }
  if (lower.includes('engine') || lower.includes('transmission') || lower.includes('clutch')) {
    return 'Engine/Transmission';
  }
  if (lower.includes('diagnostic') || lower.includes('troubleshoot') || lower.includes('check')) {
    return 'Diagnostic';
  }
  if (lower.includes('replace') || lower.includes('install')) {
    return 'Repair';
  }

  return 'General Service';
}

function estimateHours(serviceName: string, category: string): number {
  const lower = serviceName.toLowerCase();

  // Specific service time estimates
  if (lower.includes('oil change')) return 0.5;
  if (lower.includes('brake pad')) return 1.5;
  if (lower.includes('brake rotor')) return 2.0;
  if (lower.includes('tire')) return 1.0;
  if (lower.includes('alignment')) return 1.5;
  if (lower.includes('diagnostic')) return 1.0;

  // Category-based estimates
  switch (category) {
    case 'Maintenance': return 1.0;
    case 'Brake Service': return 2.0;
    case 'Tire Service': return 1.5;
    case 'Engine/Transmission': return 3.0;
    case 'Diagnostic': return 1.0;
    case 'Repair': return 2.5;
    default: return 1.5;
  }
}

function determineLaborRateType(category: string): keyof LaborRateData {
  switch (category) {
    case 'Diagnostic': return 'diagnostic_rate';
    case 'Engine/Transmission': return 'standard_rate';
    case 'Brake Service': return 'standard_rate';
    case 'Tire Service': return 'standard_rate';
    case 'Maintenance': return 'standard_rate';
    default: return 'standard_rate';
  }
}

function getLaborRate(rates: LaborRateData, rateType: keyof LaborRateData): number {
  return rates[rateType] || rates.standard_rate;
}
