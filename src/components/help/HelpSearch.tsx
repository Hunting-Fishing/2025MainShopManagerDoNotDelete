import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface SimpleSearchResult {
  id: string;
  title: string;
  type: string;
  content: string;
}

interface HelpSearchProps {
  className?: string;
}

export const HelpSearch: React.FC<HelpSearchProps> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SimpleSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Mock search results for now
    const mockResults: SimpleSearchResult[] = [
      {
        id: '1',
        title: 'Getting Started Guide',
        type: 'article',
        content: 'Learn the basics of using the platform...'
      },
      {
        id: '2', 
        title: 'Troubleshooting Common Issues',
        type: 'article',
        content: 'Solutions to frequently encountered problems...'
      },
      {
        id: '3',
        title: 'User Manual PDF',
        type: 'resource',
        content: 'Complete user documentation in PDF format...'
      }
    ].filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(mockResults);
    setShowResults(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleResultClick = (result: SimpleSearchResult) => {
    if (result.type === 'article') {
      navigate(`/help/article/${result.id}`);
    }
    setShowResults(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search help articles and resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-4">
            {query && results.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : query && results.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-3">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </div>
                {results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-3 rounded-lg hover:bg-muted cursor-pointer border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{result.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.content}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Start typing to search help content...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};