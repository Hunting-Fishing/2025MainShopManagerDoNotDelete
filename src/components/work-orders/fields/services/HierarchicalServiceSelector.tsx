
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";

interface HierarchicalServiceSelectorProps {
  onServiceSelected: (service: {
    mainCategory: string;
    subcategory: string;
    job: string;
    estimatedTime?: number;
  }) => void;
}

export default function HierarchicalServiceSelector({
  onServiceSelected
}: HierarchicalServiceSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  const selectedCategory = selectedCategoryId ? 
    categories.find(c => c.id === selectedCategoryId) : null;
    
  const selectedSubcategory = selectedCategory && selectedSubcategoryId ? 
    selectedCategory.subcategories.find(s => s.id === selectedSubcategoryId) : null;
    
  const selectedJob = selectedSubcategory && selectedJobId ? 
    selectedSubcategory.jobs.find(j => j.id === selectedJobId) : null;

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('service_hierarchy')
          .select('*')
          .order('position');
        
        if (error) throw new Error(error.message);
        
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching service categories:', err);
        setError('Failed to load service categories');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Reset dependent selectors when selections change
  useEffect(() => {
    if (!selectedCategoryId) {
      setSelectedSubcategoryId(null);
      setSelectedJobId(null);
    }
  }, [selectedCategoryId]);
  
  useEffect(() => {
    if (!selectedSubcategoryId) {
      setSelectedJobId(null);
    }
  }, [selectedSubcategoryId]);

  // When all selections are made, notify parent
  useEffect(() => {
    if (selectedCategory && selectedSubcategory && selectedJob) {
      onServiceSelected({
        mainCategory: selectedCategory.name,
        subcategory: selectedSubcategory.name,
        job: selectedJob.name,
        estimatedTime: selectedJob.estimatedTime
      });
    }
  }, [selectedCategory, selectedSubcategory, selectedJob, onServiceSelected]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Service Category</Label>
        <Select 
          value={selectedCategoryId || ''} 
          onValueChange={setSelectedCategoryId}
          disabled={loading || categories.length === 0}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {loading && <p className="text-sm text-muted-foreground mt-1">Loading categories...</p>}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
      
      {selectedCategory && (
        <div>
          <Label>Subcategory</Label>
          <Select 
            value={selectedSubcategoryId || ''} 
            onValueChange={setSelectedSubcategoryId}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent>
              {selectedCategory.subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {selectedSubcategory && (
        <div>
          <Label>Job/Service</Label>
          <Select 
            value={selectedJobId || ''} 
            onValueChange={setSelectedJobId}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              {selectedSubcategory.jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {selectedJob && selectedJob.estimatedTime && (
        <div className="p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200 text-sm">
          Estimated time: {Math.floor(selectedJob.estimatedTime / 60)}h {selectedJob.estimatedTime % 60}m
        </div>
      )}
    </div>
  );
}
