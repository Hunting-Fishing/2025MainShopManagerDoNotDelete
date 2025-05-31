import { WorkOrderJobLine } from '@/types/jobLine';

export function parseJobLinesFromDescription(description: string, workOrderId: string): WorkOrderJobLine[] {
  console.log('Parsing job lines from description:', description);
  
  if (!description) {
    return [];
  }

  const jobLines: WorkOrderJobLine[] = [];
  const lines = description.split('\n');

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines or lines that are just separators
    if (!trimmedLine || trimmedLine.match(/^[-=_\s]+$/)) return;
    
    // For lines with multiple dashes, take only the last segment as the actual service
    const segments = trimmedLine.split('-').map(seg => seg.trim());
    
    // Only process if we have multiple segments (navigation path format)
    if (segments.length < 2) return;
    
    const actualService = segments[segments.length - 1]; // Take the last segment only
    
    // Skip if the last segment is too short or doesn't contain actionable work
    if (actualService.length < 5) return;
    
    // Enhanced patterns for actual service tasks - focus on action verbs and specific work
    const servicePatterns = [
      /^(R\s*&\s*R\s+.+)/i,           // R & R patterns
      /^(Replace\s+.+)/i,             // Replace patterns
      /^(Install\s+.+)/i,             // Install patterns
      /^(Remove\s+.+)/i,              // Remove patterns
      /^(Repair\s+.+)/i,              // Repair patterns
      /^(Service\s+.+)/i,             // Service patterns
      /^(Check\s+.+)/i,               // Check patterns
      /^(Test\s+.+)/i,                // Test patterns
      /^(Flush\s+.+)/i,               // Flush patterns
      /^(Bleed\s+.+)/i,               // Bleed patterns
      /^(Change\s+.+)/i,              // Change patterns
      /^(Adjust\s+.+)/i,              // Adjust patterns
      /^(Clean\s+.+)/i,               // Clean patterns
      /^(Inspect\s+.+)/i,             // Inspect patterns
      /^(.+(?:BELT|RADIATOR|BRAKE|ENGINE|TRANSMISSION|TIRE|BATTERY|ALTERNATOR|STARTER|PUMP|CLUTCH|SUSPENSION|EXHAUST|FILTER|CYLINDER|WHEEL|OIL|FLUID).+)/i, // Specific part patterns
    ];

    let serviceName = actualService;
    let category = 'General Service';
    let isValidService = false;

    // Try to match against known patterns to verify this is an actual service task
    for (const pattern of servicePatterns) {
      const match = actualService.match(pattern);
      if (match) {
        serviceName = match[1].trim();
        isValidService = true;
        
        // Determine category based on the service type
        if (pattern.source.includes('R\\s*&\\s*R') || pattern.source.includes('Replace')) {
          category = 'Remove & Replace';
        } else if (pattern.source.includes('Repair') || pattern.source.includes('Service')) {
          category = 'Repair';
        } else if (pattern.source.includes('Install')) {
          category = 'Installation';
        } else if (pattern.source.includes('Check') || pattern.source.includes('Test') || pattern.source.includes('Inspect')) {
          category = 'Inspection';
        } else if (pattern.source.includes('Flush') || pattern.source.includes('Change') || pattern.source.includes('Clean')) {
          category = 'Maintenance';
        } else if (actualService.toUpperCase().includes('BRAKE')) {
          category = 'Brake Service';
        } else if (actualService.toUpperCase().includes('ENGINE') || actualService.toUpperCase().includes('OIL')) {
          category = 'Engine Service';
        } else if (actualService.toUpperCase().includes('BELT') || actualService.toUpperCase().includes('SERPENTINE')) {
          category = 'Belt Service';
        }
        break;
      }
    }

    // Only create job line if it matches a valid service pattern
    if (!isValidService) {
      console.log('Skipping non-service line:', actualService);
      return;
    }

    // Create job line with clean service name (no navigation path)
    const estimatedHours = estimateHoursForJob(serviceName);
    const laborRate = 125; // Default labor rate

    const jobLine: WorkOrderJobLine = {
      id: `${workOrderId}-job-${index + 1}`,
      workOrderId,
      name: formatJobLineName(serviceName),
      category,
      description: serviceName, // Use only the clean service name, no navigation path
      status: 'pending',
      estimatedHours,
      laborRate,
      totalAmount: estimatedHours * laborRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jobLines.push(jobLine);
    console.log('Created job line:', jobLine);
  });

  console.log('Total job lines created:', jobLines.length);
  return jobLines;
}

function estimateHoursForJob(jobName: string): number {
  const jobNameLower = jobName.toLowerCase();
  
  // R & R (Remove & Replace) operations typically take longer
  if (jobNameLower.includes('r & r') || jobNameLower.includes('remove') || jobNameLower.includes('replace')) {
    if (jobNameLower.includes('engine') || jobNameLower.includes('transmission')) {
      return 8.0; // Major component replacement
    } else if (jobNameLower.includes('radiator') || jobNameLower.includes('brake')) {
      return 3.0; // Medium complexity replacement
    } else if (jobNameLower.includes('belt') || jobNameLower.includes('serpentine')) {
      return 1.5; // Belt replacement
    } else if (jobNameLower.includes('battery') || jobNameLower.includes('filter')) {
      return 0.5; // Quick replacement
    }
    return 2.0; // Default R & R time
  }
  
  // Service and maintenance operations
  if (jobNameLower.includes('service') || jobNameLower.includes('maintenance')) {
    return 1.5;
  }
  
  // Installation operations
  if (jobNameLower.includes('install')) {
    return 2.0;
  }
  
  // Inspection and diagnostic operations
  if (jobNameLower.includes('check') || jobNameLower.includes('inspect') || jobNameLower.includes('test')) {
    return 1.0;
  }
  
  // Fluid operations
  if (jobNameLower.includes('flush') || jobNameLower.includes('change oil') || jobNameLower.includes('bleed')) {
    return 1.0;
  }
  
  // Default estimation
  return 1.5;
}

function formatJobLineName(jobName: string): string {
  // Clean up the job name for display
  return jobName
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .replace(/^(r\s*&\s*r)\s+/i, 'R & R ') // Standardize R & R formatting
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Title case
}
