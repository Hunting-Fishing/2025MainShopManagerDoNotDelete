
import React, { useState, useEffect } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import ServiceCategoriesList from './hierarchy/ServiceCategoriesList';
import ServiceCategoryDetails from './hierarchy/ServiceCategoryDetails';
import ServiceEditor from './ServiceEditor';
import ServiceSearchBar from './hierarchy/ServiceSearchBar';
import { useServiceHierarchy } from './hooks/useServiceHierarchy';
import { CategoryColorStyle } from './ServiceEditor';
import { toast } from 'sonner';

export default function ServiceHierarchyManager() {
  const { 
    categories, 
    isLoading, 
    error,
    selectedCategory,
    selectedSubcategory,
    selectedJob,
    handleSelectCategory,
    handleSelectSubcategory,
    handleSelectJob,
    handleSaveCategory,
    handleSaveSubcategory,
    handleSaveJob,
    handleDeleteCategory,
    handleDeleteSubcategory,
    handleDeleteJob,
    handleAddCategory,
    handleAddSubcategory,
    handleAddJob,
    categoryColors,
    selectedColorIndex,
    handleColorChange
  } = useServiceHierarchy();
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left column - Search and Categories */}
      <div className="col-span-12 md:col-span-5 lg:col-span-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-full">
          <ServiceSearchBar 
            categories={categories}
            onSelectCategory={handleSelectCategory}
            onSelectSubcategory={handleSelectSubcategory}
            onSelectJob={handleSelectJob}
          />
          
          <div className="mt-4">
            <ServiceCategoriesList
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              selectedJob={selectedJob}
              onSelectCategory={handleSelectCategory}
              onSelectSubcategory={handleSelectSubcategory}
              onSelectJob={handleSelectJob}
              onAddCategory={handleAddCategory}
              onAddSubcategory={handleAddSubcategory}
              onAddJob={handleAddJob}
              onDeleteCategory={handleDeleteCategory}
              onDeleteSubcategory={handleDeleteSubcategory}
              onDeleteJob={handleDeleteJob}
              categoryColors={categoryColors}
            />
          </div>
        </div>
      </div>
      
      {/* Right column - Details and Editor */}
      <div className="col-span-12 md:col-span-7 lg:col-span-8">
        <div className="grid gap-4">
          {/* Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <ServiceCategoryDetails
              category={selectedCategory}
              subcategory={selectedSubcategory}
              job={selectedJob}
              categoryColors={categoryColors}
              selectedColorIndex={selectedColorIndex}
            />
          </div>
          
          {/* Editor Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <ServiceEditor
              category={selectedCategory}
              subcategory={selectedSubcategory}
              job={selectedJob}
              onSave={(category, subcategory, job) => {
                if (category) handleSaveCategory(category);
                if (subcategory) handleSaveSubcategory(subcategory);
                if (job) handleSaveJob(job);
              }}
              categoryColors={categoryColors}
              colorIndex={selectedColorIndex}
              onColorChange={handleColorChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export named component for better imports
export { default as ServiceHierarchyManager } from './ServiceHierarchyManager';
