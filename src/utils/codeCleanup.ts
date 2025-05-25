
/**
 * Code Cleanup Utilities
 * Tools for identifying and cleaning up unused code
 */

export interface CleanupItem {
  type: 'unused_file' | 'duplicate_code' | 'unused_import' | 'dead_code';
  location: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  risk: 'safe' | 'moderate' | 'risky';
  solution: string;
}

export const identifiedCleanupItems: CleanupItem[] = [
  {
    type: 'unused_file',
    location: 'src/data/vinDatabase.ts',
    description: 'Empty deprecated VIN database file',
    impact: 'low',
    risk: 'safe',
    solution: 'File removed - contained only empty mock data'
  },
  {
    type: 'duplicate_code',
    location: 'src/services/dashboardService.ts',
    description: 'Duplicate of src/services/dashboard/index.ts',
    impact: 'medium',
    risk: 'safe',
    solution: 'File removed - using unified dashboard service exports'
  },
  {
    type: 'duplicate_code',
    location: 'Shop data management scattered across multiple files',
    description: 'Shop data operations not centralized',
    impact: 'high',
    risk: 'moderate',
    solution: 'Created unified shopDataService and useShopData hook'
  },
  {
    type: 'unused_import',
    location: 'Various components importing from removed files',
    description: 'Imports from cleaned up files',
    impact: 'medium',
    risk: 'safe',
    solution: 'Updated import paths to use new unified services'
  }
];

/**
 * Generate cleanup report
 */
export const generateCleanupReport = (): string => {
  let report = '# Code Cleanup Report\n\n';
  
  const itemsByType = identifiedCleanupItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, CleanupItem[]>);
  
  Object.entries(itemsByType).forEach(([type, items]) => {
    report += `## ${type.replace('_', ' ').toUpperCase()}\n\n`;
    
    items.forEach((item, index) => {
      const riskIcon = item.risk === 'safe' ? '✅' : item.risk === 'moderate' ? '⚠️' : '🚨';
      const impactIcon = item.impact === 'low' ? '🟢' : item.impact === 'medium' ? '🟡' : '🔴';
      
      report += `### ${index + 1}. ${item.location}\n`;
      report += `${riskIcon} **Risk**: ${item.risk} | ${impactIcon} **Impact**: ${item.impact}\n\n`;
      report += `**Description**: ${item.description}\n\n`;
      report += `**Solution**: ${item.solution}\n\n`;
    });
  });
  
  const totalItems = identifiedCleanupItems.length;
  const safeItems = identifiedCleanupItems.filter(i => i.risk === 'safe').length;
  const highImpactItems = identifiedCleanupItems.filter(i => i.impact === 'high').length;
  
  report += `## Summary\n`;
  report += `- Total cleanup items: ${totalItems}\n`;
  report += `- Safe to remove: ${safeItems}\n`;
  report += `- High impact fixes: ${highImpactItems}\n`;
  
  return report;
};

/**
 * Verification checklist for cleanup
 */
export const verificationChecklist = [
  'All tests still pass',
  'Application builds successfully', 
  'No console errors in browser',
  'Main user flows work correctly',
  'Shop data can be saved and retrieved',
  'Dashboard loads without errors',
  'No broken import statements'
];
