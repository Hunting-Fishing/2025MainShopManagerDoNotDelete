
import { WorkOrderJobLine } from '@/types/jobLine';
import { 
  loadJobLinesFromDatabase as loadJobLinesFromDB, 
  saveJobLinesToDatabase as saveJobLinesToDB 
} from './jobLineDatabase';

export async function loadJobLinesFromDatabase(workOrderId: string): Promise<WorkOrderJobLine[]> {
  return await loadJobLinesFromDB(workOrderId);
}

export async function saveJobLinesToDatabase(workOrderId: string, jobLines: WorkOrderJobLine[]): Promise<void> {
  return await saveJobLinesToDB(workOrderId, jobLines);
}

export async function addJobLineToDatabase(workOrderId: string, jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkOrderJobLine> {
  // Generate a new ID and timestamps
  const newJobLine: WorkOrderJobLine = {
    ...jobLine,
    id: `jl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    workOrderId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Load existing job lines
  const existingJobLines = await loadJobLinesFromDB(workOrderId);
  
  // Add the new job line
  const updatedJobLines = [...existingJobLines, newJobLine];
  
  // Save all job lines back to database
  await saveJobLinesToDB(workOrderId, updatedJobLines);
  
  return newJobLine;
}

export async function updateJobLineInDatabase(workOrderId: string, updatedJobLine: WorkOrderJobLine): Promise<void> {
  // Load existing job lines
  const existingJobLines = await loadJobLinesFromDB(workOrderId);
  
  // Update the specific job line
  const updatedJobLines = existingJobLines.map(jobLine => 
    jobLine.id === updatedJobLine.id 
      ? { ...updatedJobLine, updatedAt: new Date().toISOString() }
      : jobLine
  );
  
  // Save updated job lines back to database
  await saveJobLinesToDB(workOrderId, updatedJobLines);
}

export async function deleteJobLineFromDatabase(workOrderId: string, jobLineId: string): Promise<void> {
  // Load existing job lines
  const existingJobLines = await loadJobLinesFromDB(workOrderId);
  
  // Filter out the deleted job line
  const updatedJobLines = existingJobLines.filter(jobLine => jobLine.id !== jobLineId);
  
  // Save updated job lines back to database
  await saveJobLinesToDB(workOrderId, updatedJobLines);
}
