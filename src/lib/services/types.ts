
// Unified types for service import functionality
export interface StorageFile {
  name: string;
  path: string;
  size?: number;
  type?: string;
  lastModified?: Date;
}

export interface SectorFiles {
  sectorName: string;
  excelFiles: StorageFile[];
  totalFiles: number;
}

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ImportStats {
  totalSectors: number;
  totalCategories: number;
  totalSubcategories: number;
  totalServices: number;
  filesProcessed: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
}

export interface ProcessedServiceData {
  sectors: any[];
  stats: ImportStats;
}
