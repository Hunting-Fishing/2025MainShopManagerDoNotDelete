import React, { useState, useEffect } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

export interface CategoryColorStyle {
  bg: string;
  text: string;
  border: string;
}

// Expanded color palette with distinct colors
const DEFAULT_COLOR_STYLES: CategoryColorStyle[] = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300' },
];

interface ServiceEditorProps {
  category: ServiceMainCategory | undefined;
  subcategory: ServiceSubcategory | undefined;
  job: ServiceJob | undefined;
  onSave: (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => void;
  categoryColors?: Array<CategoryColorStyle>;
  colorIndex?: number;
  onColorChange?: (index: number) => void;
}

export const ServiceEditor: React.FC<ServiceEditorProps> = ({
  category,
  subcategory,
  job,
  onSave,
  categoryColors = DEFAULT_COLOR_STYLES,
  colorIndex = 0,
  onColorChange
}) => {
  // State for edited values
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedPrice, setEditedPrice] = useState<number>(0);
  const [editedTime, setEditedTime] = useState<number>(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(colorIndex);

  // Update form state when selection changes
  useEffect(() => {
    if (job) {
      setEditedName(job.name || '');
      setEditedDescription(job.description || '');
      setEditedPrice(job.price || 0);
      setEditedTime(job.estimatedTime || 0);
    } else if (subcategory) {
      setEditedName(subcategory.name || '');
      setEditedDescription(subcategory.description || '');
    } else if (category) {
      setEditedName(category.name || '');
      setEditedDescription(category.description || '');
    }
    
    setSelectedColorIndex(colorIndex);
  }, [category, subcategory, job, colorIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (job) {
      const updatedJob: ServiceJob = {
        ...job,
        name: editedName,
        description: editedDescription,
        price: editedPrice,
        estimatedTime: editedTime
      };
      onSave(null, null, updatedJob);
    } else if (subcategory) {
      const updatedSubcategory: ServiceSubcategory = {
        ...subcategory,
        name: editedName,
        description: editedDescription
      };
      onSave(null, updatedSubcategory, null);
    } else if (category) {
      const updatedCategory: ServiceMainCategory = {
        ...category,
        name: editedName,
        description: editedDescription
      };
      
      // Apply color change if provided
      if (onColorChange && selectedColorIndex !== colorIndex) {
        onColorChange(selectedColorIndex);
      }
      
      onSave(updatedCategory, null, null);
    }
  };

  // Determine what we're editing
  const getEditorTitle = () => {
    if (job) return `Edit Service: ${job.name}`;
    if (subcategory) return `Edit Subcategory: ${subcategory.name}`;
    if (category) return `Edit Category: ${category.name}`;
    return 'Service Editor';
  };

  if (!category) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Please select a service to edit</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{getEditorTitle()}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Enter name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Enter description"
            rows={3}
          />
        </div>

        {job && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(parseFloat(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Estimated Time (minutes)</Label>
                <Input
                  id="time"
                  type="number"
                  min="0"
                  value={editedTime}
                  onChange={(e) => setEditedTime(parseInt(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </>
        )}

        {category && !subcategory && !job && categoryColors.length > 0 && (
          <div className="space-y-2">
            <Label>Color Scheme</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {categoryColors.map((color, index) => (
                <div 
                  key={index} 
                  className={`
                    w-8 h-8 rounded-full cursor-pointer flex items-center justify-center
                    ${color.bg} ${color.border}
                    ${selectedColorIndex === index ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                  `}
                  onClick={() => setSelectedColorIndex(index)}
                >
                  {selectedColorIndex === index && (
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 bg-white p-3 border rounded-md shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" />
                <Badge className={`
                  ${categoryColors[selectedColorIndex].bg} 
                  ${categoryColors[selectedColorIndex].text} 
                  ${categoryColors[selectedColorIndex].border}
                `}>
                  {editedName || 'Category Name'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${categoryColors[selectedColorIndex].bg} border ${categoryColors[selectedColorIndex].border}`}></span>
                <span className="text-sm">Example subcategory</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceEditor;
