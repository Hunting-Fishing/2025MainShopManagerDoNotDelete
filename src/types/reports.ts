
export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  type: string;
  filters: Record<string, any>;
  createdAt: string;
  scheduled?: {
    frequency: string;
    email: string;
  };
}

export interface ReportDataPoint {
  label: string;
  value: number;
  extraData?: Record<string, any>;
}

export interface ReportConfig {
  title: string;
  description?: string;
  fields: string[];
  filters: Record<string, any>;
  sorting: {
    field: string;
    direction: "asc" | "desc";
  };
  groupBy?: string;
}

export interface ComparisonReportData {
  name: string;
  current: number;
  previous: number;
  change: number;
}
