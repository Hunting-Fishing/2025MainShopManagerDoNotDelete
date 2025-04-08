
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  FilePlus, 
  Search, 
  MoreVertical, 
  FileEdit, 
  Printer, 
  Copy, 
  Trash2,
  Grid2X2,
  List,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { toast } from "sonner";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormBuilderTemplate } from "@/types/formBuilder";
import { FormCategory } from "@/types/form";
import { getAllFormTemplates, deleteFormTemplate, getFormTemplateCountByCategory, FormQueryParams } from "@/services/formBuilderService";
import { getFormCategories } from "@/services/formCategoryService";

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'created_at' | 'updated_at' | 'category';
type SortDirection = 'asc' | 'desc';

export const EnhancedFormTemplatesList = () => {
  const [templates, setTemplates] = useState<Partial<FormBuilderTemplate>[]>([]);
  const [categories, setCategories] = useState<FormCategory[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showPublishedOnly, setShowPublishedOnly] = useState<boolean>(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
    loadCategories();
    loadCategoryCounts();
  }, [selectedCategory, sortField, sortDirection, showPublishedOnly]);

  // Separate effect for search to debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTemplates();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadTemplates = async () => {
    setLoading(true);
    
    const params: FormQueryParams = {
      sortBy: sortField,
      sortOrder: sortDirection,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      isPublished: showPublishedOnly ? true : undefined
    };
    
    const data = await getAllFormTemplates(params);
    setTemplates(data);
    setLoading(false);
  };

  const loadCategories = async () => {
    const data = await getFormCategories();
    setCategories(data);
  };

  const loadCategoryCounts = async () => {
    const data = await getFormTemplateCountByCategory();
    setCategoryCounts(data);
  };

  const handleDeleteTemplate = async (id: string) => {
    const success = await deleteFormTemplate(id);
    if (success) {
      setTemplates(templates.filter(template => template.id !== id));
      toast.success("Form template deleted successfully");
      loadCategoryCounts();
    } else {
      toast.error("Failed to delete form template");
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate(`/forms/${template.id}/edit`)}>
                    <FileEdit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteTemplate(template.id as string)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between mt-1">
              <CardDescription className="text-xs">
                {template.category}
              </CardDescription>
              {template.isPublished ? (
                <Badge variant="success" className="text-xs">Published</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Draft</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground line-clamp-2">{template.description || "No description available"}</p>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/forms/${template.id}`)}>
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/forms/${template.id}/edit`)}>
              Edit
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {templates.map((template) => (
        <Card key={template.id} className="hover:bg-muted/30 transition-colors">
          <div className="flex items-center p-3">
            <div className="flex-1">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="font-medium">{template.name}</h3>
                <div className="ml-3">
                  {template.isPublished ? (
                    <Badge variant="success" className="text-xs">Published</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Draft</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {template.description || "No description available"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{template.category}</Badge>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/forms/${template.id}`)}>
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/forms/${template.id}/edit`)}>
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteTemplate(template.id as string)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderCategorySidebar = () => (
    <div className="w-64 pr-6 border-r shrink-0 hidden lg:block">
      <h3 className="font-semibold mb-3">Categories</h3>
      <div className="space-y-1">
        <button
          className={`w-full text-left px-2 py-1.5 rounded-md flex items-center justify-between hover:bg-muted/60 ${selectedCategory === null ? 'bg-muted font-medium' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          <span>All Forms</span>
          <Badge variant="secondary">{templates.length}</Badge>
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            className={`w-full text-left px-2 py-1.5 rounded-md flex items-center justify-between hover:bg-muted/60 ${selectedCategory === category.name ? 'bg-muted font-medium' : ''}`}
            onClick={() => setSelectedCategory(category.name)}
          >
            <span>{category.name}</span>
            <Badge variant="secondary">{categoryCounts[category.name] || 0}</Badge>
          </button>
        ))}
      </div>
    </div>
  );

  const renderFilterBar = () => (
    <div className="flex items-center gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Categories</h4>
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-4">
                  <div className="flex items-center">
                    <Checkbox 
                      id="all-categories"
                      checked={selectedCategory === null}
                      onCheckedChange={() => setSelectedCategory(null)}
                    />
                    <label htmlFor="all-categories" className="ml-2 text-sm">
                      All Categories
                    </label>
                  </div>
                  
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox 
                        id={`category-${category.id}`}
                        checked={selectedCategory === category.name}
                        onCheckedChange={() => setSelectedCategory(category.name)}
                      />
                      <label htmlFor={`category-${category.id}`} className="ml-2 text-sm">
                        {category.name} ({categoryCounts[category.name] || 0})
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <div className="flex items-center">
                <Checkbox 
                  id="published-only"
                  checked={showPublishedOnly}
                  onCheckedChange={(checked) => setShowPublishedOnly(checked as boolean)}
                />
                <label htmlFor="published-only" className="ml-2 text-sm">
                  Published forms only
                </label>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            Sort by
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => toggleSort('name')} className="flex items-center justify-between">
            <span>Name</span>
            {getSortIcon('name')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleSort('category')} className="flex items-center justify-between">
            <span>Category</span>
            {getSortIcon('category')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleSort('updated_at')} className="flex items-center justify-between">
            <span>Last Modified</span>
            {getSortIcon('updated_at')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleSort('created_at')} className="flex items-center justify-between">
            <span>Created Date</span>
            {getSortIcon('created_at')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="border rounded-md flex">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          className="h-9 rounded-r-none"
          onClick={() => setViewMode('grid')}
        >
          <Grid2X2 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          className="h-9 rounded-l-none"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      <Button onClick={() => navigate('/forms/create')}>
        <FilePlus className="h-4 w-4 mr-2" /> New Template
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderFilterBar()}

      <div className="flex">
        {renderCategorySidebar()}
        
        <div className="flex-1 pl-0 lg:pl-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory ? 
                  "No forms match your current filters" : 
                  "Create your first form template to get started"}
              </p>
              <Button onClick={() => navigate('/forms/create')}>
                <FilePlus className="h-4 w-4 mr-2" /> Create Template
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            renderGridView()
          ) : (
            renderListView()
          )}
        </div>
      </div>
    </div>
  );
};
