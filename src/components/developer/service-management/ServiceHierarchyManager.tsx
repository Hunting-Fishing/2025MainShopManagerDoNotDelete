
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob, CategoryColorStyle } from "@/types/serviceHierarchy";
import { ServiceCategoriesList } from "./hierarchy/ServiceCategoriesList";
import { ServiceEditor } from "./ServiceEditor";
import { ServiceBulkImport } from "./ServiceBulkImport";
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from "@/lib/services/serviceApi";
import { v4 as uuidv4 } from 'uuid';

// Category style mapping
const categoryStyles: Record<string, CategoryColorStyle> = {
  maintenance: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  repair: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  diagnostic: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  installation: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
  },
  custom: {
    bg: "bg-slate-50",
    text: "text-slate-800",
    border: "border-slate-200",
  },
};

export default function ServiceHierarchyManager() {
  // State for categories
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ServiceMainCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // State for selected items
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // State for edit mode
  const [editMode, setEditMode] = useState<"category" | "subcategory" | "job" | null>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    price: 0,
    estimatedTime: 0,
  });

  // Import modal state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Filter categories when search or filter changes
  useEffect(() => {
    filterCategories();
  }, [searchQuery, filterCategory, categories]);

  // Load categories from API
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
        
        // If the first category has subcategories, select the first one
        if (data[0].subcategories && data[0].subcategories.length > 0) {
          setSelectedSubcategoryId(data[0].subcategories[0].id);
          
          // If the first subcategory has jobs, select the first job
          if (data[0].subcategories[0].jobs && data[0].subcategories[0].jobs.length > 0) {
            setSelectedJobId(data[0].subcategories[0].jobs[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter categories based on search and category filter
  const filterCategories = () => {
    let filtered = [...categories];

    if (searchQuery) {
      filtered = filtered.filter((category) => {
        const matchCategory = category.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Search in subcategories
        const hasMatchingSubcategories = category.subcategories?.some(
          (sub) => 
            sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sub.description && sub.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            // Search in jobs
            sub.jobs?.some(
              (job) => 
                job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        );
        
        return matchCategory || hasMatchingSubcategories;
      });
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (category) => category.name.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    setFilteredCategories(filtered);
  };

  // Get the selected category object
  const getSelectedCategory = (): ServiceMainCategory | null => {
    if (!selectedCategoryId) return null;
    return categories.find((cat) => cat.id === selectedCategoryId) || null;
  };

  // Get the selected subcategory object
  const getSelectedSubcategory = (): ServiceSubcategory | null => {
    if (!selectedCategoryId || !selectedSubcategoryId) return null;
    const category = categories.find((cat) => cat.id === selectedCategoryId);
    if (!category || !category.subcategories) return null;
    return category.subcategories.find((sub) => sub.id === selectedSubcategoryId) || null;
  };

  // Get the selected job object
  const getSelectedJob = (): ServiceJob | null => {
    if (!selectedCategoryId || !selectedSubcategoryId || !selectedJobId) return null;
    const subcategory = getSelectedSubcategory();
    if (!subcategory || !subcategory.jobs) return null;
    return subcategory.jobs.find((job) => job.id === selectedJobId) || null;
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
    setSelectedJobId(null);
    setEditMode(null);
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setSelectedJobId(null);
    setEditMode(null);
    
    // If there are jobs in this subcategory, select the first one
    const subcategory = getSelectedCategory()?.subcategories?.find(
      (sub) => sub.id === subcategoryId
    );
    if (subcategory?.jobs && subcategory.jobs.length > 0) {
      setSelectedJobId(subcategory.jobs[0].id);
    }
  };

  // Handle job selection
  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setEditMode(null);
  };

  // Add new category
  const handleAddCategory = () => {
    setEditMode("category");
    setFormData({
      name: "",
      description: "",
    });
  };

  // Add new subcategory
  const handleAddSubcategory = () => {
    if (!selectedCategoryId) {
      toast({
        title: "Error",
        description: "Please select a category first",
        variant: "destructive",
      });
      return;
    }
    setEditMode("subcategory");
    setFormData({
      name: "",
      description: "",
    });
  };

  // Add new job
  const handleAddJob = () => {
    if (!selectedCategoryId || !selectedSubcategoryId) {
      toast({
        title: "Error",
        description: "Please select a subcategory first",
        variant: "destructive",
      });
      return;
    }
    setEditMode("job");
    setFormData({
      name: "",
      description: "",
      price: 0,
      estimatedTime: 0,
    });
  };

  // Save form data
  const handleSaveForm = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      let updatedCategory: ServiceMainCategory;

      if (editMode === "category") {
        // Create new category
        const newCategory: ServiceMainCategory = {
          id: uuidv4(),
          name: formData.name,
          description: formData.description || "",
          position: categories.length + 1,
          subcategories: [],
        };
        updatedCategory = await saveServiceCategory(newCategory);
        setCategories([...categories, updatedCategory]);
        setSelectedCategoryId(updatedCategory.id);
      } else {
        // Update existing category with new subcategory or job
        const category = getSelectedCategory();
        if (!category) return;

        const updatedCategoryData = { ...category };

        if (editMode === "subcategory") {
          // Add new subcategory to category
          const newSubcategory: ServiceSubcategory = {
            id: uuidv4(),
            name: formData.name,
            description: formData.description || "",
            jobs: [],
          };
          updatedCategoryData.subcategories = [...(category.subcategories || []), newSubcategory];
          updatedCategory = await saveServiceCategory(updatedCategoryData);
          setSelectedSubcategoryId(newSubcategory.id);
        } else if (editMode === "job") {
          // Add new job to subcategory
          const subcategory = getSelectedSubcategory();
          if (!subcategory) return;

          const newJob: ServiceJob = {
            id: uuidv4(),
            name: formData.name,
            description: formData.description || "",
            price: formData.price || 0,
            estimatedTime: formData.estimatedTime || 0,
          };

          updatedCategoryData.subcategories = category.subcategories?.map((sub) => {
            if (sub.id === selectedSubcategoryId) {
              return {
                ...sub,
                jobs: [...(sub.jobs || []), newJob],
              };
            }
            return sub;
          });
          updatedCategory = await saveServiceCategory(updatedCategoryData);
          setSelectedJobId(newJob.id);
        }

        // Update the categories state with the updated category
        setCategories(
          categories.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
        );
      }

      setEditMode(null);
      toast({
        title: "Success",
        description: `Successfully saved ${editMode}`,
      });
    } catch (error) {
      console.error("Failed to save:", error);
      toast({
        title: "Error",
        description: `Failed to save ${editMode}`,
        variant: "destructive",
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle bulk import completion
  const handleBulkImportComplete = async () => {
    await loadCategories();
    setIsBulkImportOpen(false);
    toast({
      title: "Import Complete",
      description: "Service categories have been successfully imported",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {/* Left column: Categories */}
      <div className="md:col-span-1">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Service Categories</h3>
            <div className="flex gap-2">
              <Button
                onClick={handleAddCategory}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
              <Button
                onClick={() => setIsBulkImportOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>
          
          <div className="mb-4 flex gap-2">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                prefix={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="diagnostic">Diagnostic</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories List */}
          <ServiceCategoriesList
            categories={filteredCategories}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            selectedJobId={selectedJobId}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            onJobSelect={handleJobSelect}
            isLoading={isLoading}
            categoryStyles={categoryStyles}
          />
        </Card>
      </div>

      {/* Right column: Details and editing */}
      <div className="md:col-span-2">
        <Card className="p-4">
          {editMode ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {editMode === "category"
                  ? "Add New Category"
                  : editMode === "subcategory"
                  ? "Add New Subcategory"
                  : "Add New Job/Service"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter name"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter description (optional)"
                    className="w-full"
                  />
                </div>
                {editMode === "job" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price ($)</label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
                        placeholder="Enter price"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Estimated Time (minutes)
                      </label>
                      <Input
                        type="number"
                        value={formData.estimatedTime}
                        onChange={(e) => handleInputChange("estimatedTime", parseInt(e.target.value, 10))}
                        placeholder="Enter estimated time"
                        className="w-full"
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditMode(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveForm}>Save</Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedCategoryId
                    ? selectedSubcategoryId
                      ? selectedJobId
                        ? "Job Details"
                        : "Subcategory Details"
                      : "Category Details"
                    : "Select a Category"}
                </h3>
                <div className="flex gap-2">
                  {selectedCategoryId && !selectedSubcategoryId && (
                    <Button
                      onClick={handleAddSubcategory}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Subcategory
                    </Button>
                  )}
                  {selectedSubcategoryId && (
                    <Button
                      onClick={handleAddJob}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Job
                    </Button>
                  )}
                </div>
              </div>

              {selectedCategoryId ? (
                <div>
                  {selectedJobId ? (
                    <ServiceEditor
                      type="job"
                      item={getSelectedJob()}
                      categories={categories}
                      setCategories={setCategories}
                      selectedCategoryId={selectedCategoryId}
                      selectedSubcategoryId={selectedSubcategoryId}
                    />
                  ) : selectedSubcategoryId ? (
                    <ServiceEditor
                      type="subcategory"
                      item={getSelectedSubcategory()}
                      categories={categories}
                      setCategories={setCategories}
                      selectedCategoryId={selectedCategoryId}
                    />
                  ) : (
                    <ServiceEditor
                      type="category"
                      item={getSelectedCategory()}
                      categories={categories}
                      setCategories={setCategories}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-500 p-8">
                  Select a category, subcategory, or job from the left panel to see details
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
      
      <ServiceBulkImport 
        open={isBulkImportOpen} 
        onOpenChange={setIsBulkImportOpen} 
        onImportComplete={handleBulkImportComplete} 
      />
    </div>
  );
}
