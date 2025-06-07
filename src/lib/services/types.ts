
export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
  details?: {
    sectorsProcessed: number;
    categoriesProcessed: number;
    subcategoriesProcessed: number;
    jobsProcessed: number;
    totalSectors: number;
    totalCategories: number;
    totalSubcategories: number;
    totalJobs: number;
  };
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

export interface StorageFile {
  name: string;
  id?: string;
  path?: string;
  size?: number;
  type?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  lastModified?: Date;
  metadata?: any;
}

export interface SectorFiles {
  sectorName: string;
  excelFiles: StorageFile[];
  totalFiles: number;
}

export interface ImportOptions {
  mode: 'skip' | 'update';
  clearExisting?: boolean;
}
