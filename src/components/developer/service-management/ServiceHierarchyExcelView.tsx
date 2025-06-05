
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Copy, Save, Download, Upload } from 'lucide-react';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { toast } from 'sonner';

interface FlatServiceRow {
  id: string;
  type: 'sector' | 'category' | 'subcategory' | 'job';
  sectorId?: string;
  sectorName?: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  jobId?: string;
  jobName?: string;
  description?: string;
  estimatedTime?: number;
  price?: number;
  position?: number;
  isNew?: boolean;
  isEdited?: boolean;
}

interface ServiceHierarchyExcelViewProps {
  sectors: ServiceSector[];
  onSave: (data: any) => Promise<void>;
}

export function ServiceHierarchyExcelView({ sectors, onSave }: ServiceHierarchyExcelViewProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [data, setData] = useState<FlatServiceRow[]>(() => flattenServiceData(sectors));

  // Flatten the hierarchical service data into a flat table structure
  function flattenServiceData(sectors: ServiceSector[]): FlatServiceRow[] {
    const rows: FlatServiceRow[] = [];
    
    sectors.forEach(sector => {
      // Add sector row
      rows.push({
        id: `sector-${sector.id}`,
        type: 'sector',
        sectorId: sector.id,
        sectorName: sector.name,
        description: sector.description,
        position: sector.position
      });

      sector.categories.forEach(category => {
        // Add category row
        rows.push({
          id: `category-${category.id}`,
          type: 'category',
          sectorId: sector.id,
          sectorName: sector.name,
          categoryId: category.id,
          categoryName: category.name,
          description: category.description,
          position: category.position
        });

        category.subcategories.forEach(subcategory => {
          // Add subcategory row
          rows.push({
            id: `subcategory-${subcategory.id}`,
            type: 'subcategory',
            sectorId: sector.id,
            sectorName: sector.name,
            categoryId: category.id,
            categoryName: category.name,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name,
            description: subcategory.description
          });

          subcategory.jobs.forEach(job => {
            // Add job row
            rows.push({
              id: `job-${job.id}`,
              type: 'job',
              sectorId: sector.id,
              sectorName: sector.name,
              categoryId: category.id,
              categoryName: category.name,
              subcategoryId: subcategory.id,
              subcategoryName: subcategory.name,
              jobId: job.id,
              jobName: job.name,
              description: job.description,
              estimatedTime: job.estimatedTime,
              price: job.price
            });
          });
        });
      });
    });

    return rows;
  }

  const updateCell = useCallback((rowId: string, field: string, value: any) => {
    setData(prev => prev.map(row => {
      if (row.id === rowId) {
        return { ...row, [field]: value, isEdited: true };
      }
      return row;
    }));
    setHasChanges(true);
  }, []);

  const addNewRow = useCallback((type: 'sector' | 'category' | 'subcategory' | 'job') => {
    const newId = `new-${type}-${Date.now()}`;
    const newRow: FlatServiceRow = {
      id: newId,
      type,
      isNew: true,
      isEdited: true
    };

    // Set default values based on type
    switch (type) {
      case 'sector':
        newRow.sectorName = 'New Sector';
        break;
      case 'category':
        newRow.categoryName = 'New Category';
        break;
      case 'subcategory':
        newRow.subcategoryName = 'New Subcategory';
        break;
      case 'job':
        newRow.jobName = 'New Service';
        newRow.estimatedTime = 30;
        newRow.price = 0;
        break;
    }

    setData(prev => [...prev, newRow]);
    setHasChanges(true);
  }, []);

  const deleteSelectedRows = useCallback(() => {
    setData(prev => prev.filter(row => !selectedRows.has(row.id)));
    setSelectedRows(new Set());
    setHasChanges(true);
    toast.success(`Deleted ${selectedRows.size} row(s)`);
  }, [selectedRows]);

  const duplicateSelectedRows = useCallback(() => {
    const rowsToDuplicate = data.filter(row => selectedRows.has(row.id));
    const duplicatedRows = rowsToDuplicate.map(row => ({
      ...row,
      id: `duplicate-${row.id}-${Date.now()}`,
      isNew: true,
      isEdited: true
    }));
    
    setData(prev => [...prev, ...duplicatedRows]);
    setSelectedRows(new Set());
    setHasChanges(true);
    toast.success(`Duplicated ${rowsToDuplicate.length} row(s)`);
  }, [data, selectedRows]);

  const handleSave = async () => {
    try {
      // Convert flat data back to hierarchical structure
      // This would need proper implementation based on your data structure
      await onSave(data);
      setHasChanges(false);
      toast.success('Changes saved successfully!');
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  const handleSelectRow = useCallback((rowId: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  }, [data]);

  const EditableCell = ({ row, field, value }: { row: FlatServiceRow; field: string; value: any }) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <Input
          value={value || ''}
          onChange={(e) => updateCell(row.id, field, e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditingCell(null);
            }
          }}
          className="h-8 text-sm"
          autoFocus
        />
      );
    }

    return (
      <div
        className="min-h-[32px] flex items-center cursor-pointer hover:bg-gray-50 px-2 rounded"
        onClick={() => setEditingCell({ rowId: row.id, field })}
      >
        {value || '-'}
      </div>
    );
  };

  const getRowTypeColor = (type: string) => {
    switch (type) {
      case 'sector': return 'bg-blue-50 border-l-4 border-l-blue-500';
      case 'category': return 'bg-green-50 border-l-4 border-l-green-500';
      case 'subcategory': return 'bg-yellow-50 border-l-4 border-l-yellow-500';
      case 'job': return 'bg-purple-50 border-l-4 border-l-purple-500';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Excel Table View</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewRow('sector')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Sector
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewRow('category')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Category
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewRow('subcategory')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Subcategory
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewRow('job')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Service
            </Button>
          </div>
        </div>
        
        {selectedRows.size > 0 && (
          <div className="flex items-center space-x-2 pt-2">
            <span className="text-sm text-gray-600">
              {selectedRows.size} row(s) selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={duplicateSelectedRows}
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteSelectedRows}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}

        {hasChanges && (
          <div className="flex items-center space-x-2 pt-2">
            <Badge variant="warning">Unsaved changes</Badge>
            <Button
              onClick={handleSave}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === data.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Est. Time (min)</TableHead>
                <TableHead>Price ($)</TableHead>
                <TableHead>Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow 
                  key={row.id} 
                  className={`${getRowTypeColor(row.type)} ${row.isEdited ? 'bg-yellow-100' : ''}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(row.id)}
                      onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      row.type === 'sector' ? 'info' :
                      row.type === 'category' ? 'success' :
                      row.type === 'subcategory' ? 'warning' : 'secondary'
                    }>
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <EditableCell row={row} field="sectorName" value={row.sectorName} />
                  </TableCell>
                  <TableCell>
                    <EditableCell row={row} field="categoryName" value={row.categoryName} />
                  </TableCell>
                  <TableCell>
                    <EditableCell row={row} field="subcategoryName" value={row.subcategoryName} />
                  </TableCell>
                  <TableCell>
                    <EditableCell row={row} field="jobName" value={row.jobName} />
                  </TableCell>
                  <TableCell>
                    <EditableCell row={row} field="description" value={row.description} />
                  </TableCell>
                  <TableCell>
                    <EditableCell row={row} field="estimatedTime" value={row.estimatedTime} />
                  </TableCell>
                  <TableCell>
                    <EditableCell row={row} field="price" value={row.price} />
                  </TableCell>
                  <TableCell>
                    <EditableCell row={row} field="position" value={row.position} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click any cell to edit inline</li>
            <li>Use checkboxes to select multiple rows for bulk operations</li>
            <li>Different row types are color-coded for easy identification</li>
            <li>Add new items using the buttons in the header</li>
            <li>Remember to save your changes when done editing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
