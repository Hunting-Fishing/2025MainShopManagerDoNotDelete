
import { WorkOrderJobLine } from '@/types/jobLine';

/**
 * Parse work order description to extract individual job lines
 */
export const parseJobLinesFromDescription = (description: string, workOrderId?: string): WorkOrderJobLine[] => {
  if (!description) return [];

  console.log('Parsing description:', description); // Debug log

  // Split by common delimiters and clean up
  const lines = description
    .split(/[-•·\n]/) // Split by dash, bullet, or newline
    .map(line => line.trim())
    .filter(line => line.length > 3); // Filter out very short lines

  console.log('Split lines:', lines); // Debug log

  const jobLines: WorkOrderJobLine[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines or lines that are just separators
    if (!trimmedLine || trimmedLine.match(/^[-=_\s]+$/)) return;
    
    // Enhanced patterns for job categories
    const jobPatterns = [
      /^(R\s*&\s*R\s+.+)/i,           // R & R patterns
      /^(Replace\s+.+)/i,             // Replace patterns
      /^(Install\s+.+)/i,             // Install patterns
      /^(Repair\s+.+)/i,              // Repair patterns
      /^(Service\s+.+)/i,             // Service patterns
      /^(Inspect\s+.+)/i,             // Inspect patterns
      /^(Check\s+.+)/i,               // Check patterns
      /^(Test\s+.+)/i,                // Test patterns
      /^(Flush\s+.+)/i,               // Flush patterns
      /^(Change\s+.+)/i,              // Change patterns
      /^(Adjust\s+.+)/i,              // Adjust patterns
      /^(Clean\s+.+)/i,               // Clean patterns
      /^([A-Z].{10,})/,               // General patterns (at least 10 chars starting with capital)
      /^(.+(?:RADIATOR|BRAKE|ENGINE|TRANSMISSION|TIRE|BATTERY|ALTERNATOR|STARTER|PUMP|BELT|CLUTCH|SUSPENSION|EXHAUST|FILTER).+)/i, // Specific part patterns
    ];

    let jobName = trimmedLine;
    let category = 'General Service';

    // Try to match against known patterns
    for (const pattern of jobPatterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        jobName = match[1].trim();
        
        // Determine category based on the pattern
        if (pattern.source.includes('R\\s*&\\s*R')) {
          category = 'Remove & Replace';
        } else if (pattern.source.includes('Replace')) {
          category = 'Replacement';
        } else if (pattern.source.includes('Install')) {
          category = 'Installation';
        } else if (pattern.source.includes('Repair')) {
          category = 'Repair';
        } else if (pattern.source.includes('Service')) {
          category = 'Service';
        } else if (pattern.source.includes('Inspect')) {
          category = 'Inspection';
        } else if (pattern.source.includes('Test|Check')) {
          category = 'Testing';
        } else if (pattern.source.includes('Flush|Change')) {
          category = 'Maintenance';
        } else if (pattern.source.includes('RADIATOR|BRAKE|ENGINE')) {
          category = 'Component Service';
        }
        break;
      }
    }

    // Create job line
    const estimatedHours = estimateHoursForJob(jobName);
    const laborRate = 125; // Default labor rate
    
    const jobLine: WorkOrderJobLine = {
      id: `${workOrderId || 'job'}-line-${index + 1}`,
      workOrderId,
      name: formatJobLineName(jobName),
      category,
      description: trimmedLine,
      status: 'pending',
      estimatedHours,
      laborRate,
      totalAmount: estimatedHours * laborRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Created job line:', jobLine); // Debug log
    jobLines.push(jobLine);
  });

  console.log('Final job lines:', jobLines); // Debug log
  return jobLines;
};

/**
 * Estimate hours for a job based on common patterns
 */
const estimateHoursForJob = (jobName: string): number => {
  const lowerJobName = jobName.toLowerCase();
  
  // Basic estimation based on job type
  if (lowerJobName.includes('radiator')) return 4.0;
  if (lowerJobName.includes('brake line')) return 2.5;
  if (lowerJobName.includes('brake')) return 2.0;
  if (lowerJobName.includes('engine')) return 8.0;
  if (lowerJobName.includes('transmission')) return 6.0;
  if (lowerJobName.includes('oil change')) return 0.5;
  if (lowerJobName.includes('tire')) return 1.0;
  if (lowerJobName.includes('battery')) return 0.5;
  if (lowerJobName.includes('alternator')) return 3.0;
  if (lowerJobName.includes('starter')) return 2.0;
  if (lowerJobName.includes('water pump')) return 4.5;
  if (lowerJobName.includes('fuel pump')) return 3.5;
  if (lowerJobName.includes('timing belt')) return 6.0;
  if (lowerJobName.includes('clutch')) return 8.0;
  if (lowerJobName.includes('suspension')) return 3.0;
  if (lowerJobName.includes('exhaust')) return 2.0;
  if (lowerJobName.includes('filter')) return 0.5;
  if (lowerJobName.includes('flush')) return 1.0;
  if (lowerJobName.includes('inspect')) return 0.5;
  if (lowerJobName.includes('diagnostic')) return 1.0;
  if (lowerJobName.includes('cooling system')) return 3.0;
  if (lowerJobName.includes('cylinder')) return 5.0;
  if (lowerJobName.includes('wheel')) return 1.5;
  
  // Default estimate
  return 2.0;
};

/**
 * Format job line name for display
 */
export const formatJobLineName = (name: string): string => {
  return name
    .replace(/R\s*&\s*R/gi, 'R & R')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
};
