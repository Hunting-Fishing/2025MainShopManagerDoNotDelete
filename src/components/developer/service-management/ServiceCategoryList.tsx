
import React, { useState } from 'react';
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Edit, Trash2, Plus, FileText, BarChart } from 'lucide-react';
import { formatCurrency } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ServiceCategoryListProps {
  categories: ServiceMainCategory[];
  onSelectCategory: (category: ServiceMainCategory) => void;
  onDeleteCategory: (id: string) => void;
  selectedCategory: ServiceMainCategory | null;
}

const ServiceCategoryList: React.FC<ServiceCategoryListProps> = ({
  categories,
  onSelectCategory,
  onDeleteCategory,
  selectedCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceTab, setSelectedServiceTab] = useState<'table' | 'cards'>('cards');
  const [deletingCategory, setDeletingCategory] = useState<ServiceMainCategory | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get total services count
  const getTotalServicesCount = (category: ServiceMainCategory) => {
    return category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0);
  };
  
  // Get total time for all services in category
  const getTotalTime = (category: ServiceMainCategory) => {
    const totalMinutes = category.subcategories.reduce((total, sub) => {
      return total + sub.jobs.reduce((subTotal, job) => 
        subTotal + (job.estimatedTime || 0), 0);
    }, 0);
    
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => {
    if (!searchTerm) return true;
    
    const searchRegex = new RegExp(searchTerm, 'i');
    
    // Search in category name and description
    if (searchRegex.test(category.name) || searchRegex.test(category.description || '')) {
      return true;
    }
    
    // Search in subcategories and jobs
    return category.subcategories.some(sub => 
      searchRegex.test(sub.name) || 
      sub.jobs.some(job => searchRegex.test(job.name))
    );
  });

  const handleDeleteClick = (category: ServiceMainCategory) => {
    setDeletingCategory(category);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      onDeleteCategory(deletingCategory.id);
      setShowDeleteDialog(false);
      setDeletingCategory(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-end">
        <div className="relative w-full md:w-auto md:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search categories and services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        
        <Tabs value={selectedServiceTab} onValueChange={(v) => setSelectedServiceTab(v as 'table' | 'cards')} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-2 w-full md:w-[200px]">
            <TabsTrigger value="cards" className="flex gap-2 items-center">
              <FileText className="h-4 w-4" /> Cards
            </TabsTrigger>
            <TabsTrigger value="table" className="flex gap-2 items-center">
              <BarChart className="h-4 w-4" /> Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="cards" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.length === 0 ? (
            <div className="col-span-3 p-6 text-center bg-muted/30 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No service categories found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or create a new category</p>
            </div>
          ) : (
            filteredCategories.map(category => {
              const totalServices = getTotalServicesCount(category);
              const isSelected = selectedCategory?.id === category.id;
              
              return (
                <Card 
                  key={category.id}
                  className={`
                    border-l-4 transition-all hover:shadow-md cursor-pointer
                    ${isSelected ? 'border-esm-blue-500 border-2' : 'hover:border-l-esm-blue-300'}
                  `}
                  onClick={() => onSelectCategory(category)}
                >
                  <CardHeader className={`pb-3 ${isSelected ? 'bg-esm-blue-50/50' : 'bg-white'}`}>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCategory(category);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(category);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-muted py-2 px-3 rounded flex flex-col items-center justify-center">
                        <span className="text-2xl font-semibold">{totalServices}</span>
                        <span className="text-xs text-muted-foreground">Services</span>
                      </div>
                      <div className="bg-muted py-2 px-3 rounded flex flex-col items-center justify-center">
                        <span className="text-2xl font-semibold">{category.subcategories.length}</span>
                        <span className="text-xs text-muted-foreground">Subcategories</span>
                      </div>
                    </div>
                    
                    {totalServices > 0 && (
                      <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="font-normal">
                          Total Time: {getTotalTime(category)}
                        </Badge>
                      </div>
                    )}
                    
                    {category.subcategories.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">Subcategories:</h4>
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories.slice(0, 3).map(sub => (
                            <Badge key={sub.id} variant="secondary" className="font-normal">
                              {sub.name}
                            </Badge>
                          ))}
                          {category.subcategories.length > 3 && (
                            <Badge variant="outline" className="font-normal">
                              +{category.subcategories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
          
          <Card className="border-dashed border-2 flex items-center justify-center p-6 bg-transparent hover:bg-muted/10 cursor-pointer transition-colors" onClick={() => onSelectCategory({
            id: '',
            name: 'New Category',
            description: '',
            subcategories: [],
            position: categories.length
          })}>
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Plus className="h-8 w-8 mb-2" />
              <p className="font-medium">Add New Category</p>
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="table" className="mt-0">
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32">
                        <p className="text-muted-foreground">No service categories found</p>
                        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or create a new category</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map(category => (
                      <TableRow key={category.id} className={selectedCategory?.id === category.id ? 'bg-muted/30' : undefined}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.position}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{category.subcategories.length}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{getTotalServicesCount(category)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">{category.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onSelectCategory(category)} 
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(category)} 
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{deletingCategory?.name}"? This action cannot be undone.
              {getTotalServicesCount(deletingCategory || { id: '', name: '', subcategories: [] }) > 0 && (
                <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded">
                  This category contains {getTotalServicesCount(deletingCategory || { id: '', name: '', subcategories: [] })} service(s) that will also be deleted.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceCategoryList;
