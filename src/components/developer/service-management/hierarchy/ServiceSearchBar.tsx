
import React, { useState, useEffect } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'job';
  categoryId: string;
  subcategoryId?: string;
  path: string;
}

interface ServiceSearchBarProps {
  categories: ServiceMainCategory[];
  onSelectCategory: (category: ServiceMainCategory) => void;
  onSelectSubcategory: (subcategory: ServiceSubcategory) => void;
  onSelectJob: (job: ServiceJob) => void;
}

const ServiceSearchBar: React.FC<ServiceSearchBarProps> = ({
  categories,
  onSelectCategory,
  onSelectSubcategory,
  onSelectJob
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Search categories
    categories.forEach(category => {
      if (category.name.toLowerCase().includes(lowerSearchTerm)) {
        searchResults.push({
          id: category.id,
          name: category.name,
          type: 'category',
          categoryId: category.id,
          path: category.name
        });
      }

      // Search subcategories
      category.subcategories.forEach(subcategory => {
        if (subcategory.name.toLowerCase().includes(lowerSearchTerm)) {
          searchResults.push({
            id: subcategory.id,
            name: subcategory.name,
            type: 'subcategory',
            categoryId: category.id,
            subcategoryId: subcategory.id,
            path: `${category.name} > ${subcategory.name}`
          });
        }

        // Search jobs
        subcategory.jobs.forEach(job => {
          if (
            job.name.toLowerCase().includes(lowerSearchTerm) ||
            (job.description && job.description.toLowerCase().includes(lowerSearchTerm))
          ) {
            searchResults.push({
              id: job.id,
              name: job.name,
              type: 'job',
              categoryId: category.id,
              subcategoryId: subcategory.id,
              path: `${category.name} > ${subcategory.name} > ${job.name}`
            });
          }
        });
      });
    });

    setResults(searchResults);
  }, [searchTerm, categories]);

  const handleResultClick = (result: SearchResult) => {
    const category = categories.find(c => c.id === result.categoryId);
    if (!category) return;

    if (result.type === 'category') {
      onSelectCategory(category);
    } else if (result.type === 'subcategory' && result.subcategoryId) {
      const subcategory = category.subcategories.find(s => s.id === result.subcategoryId);
      if (subcategory) {
        onSelectCategory(category);
        onSelectSubcategory(subcategory);
      }
    } else if (result.type === 'job' && result.subcategoryId) {
      const subcategory = category.subcategories.find(s => s.id === result.subcategoryId);
      if (!subcategory) return;

      const job = subcategory.jobs.find(j => j.id === result.id);
      if (job) {
        onSelectCategory(category);
        onSelectSubcategory(subcategory);
        onSelectJob(job);
      }
    }

    setSearchTerm('');
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-9 pr-9"
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full p-0 px-2"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 py-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="text-xs text-gray-500 px-3 py-1">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </div>

          {results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-center">
                <span className="font-medium">{result.name}</span>
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {result.type === 'category' && 'Category'}
                  {result.type === 'subcategory' && 'Subcategory'}
                  {result.type === 'job' && 'Service'}
                </span>
              </div>
              <div className="text-xs text-gray-500 truncate">
                {result.path}
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && searchTerm && results.length === 0 && (
        <div className="absolute z-10 w-full mt-1 py-3 bg-white border rounded-md shadow-lg text-center text-gray-500">
          No results found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default ServiceSearchBar;
