
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface DuplicateSearchOptions {
  matchTypes: {
    exact: boolean;
    exactWords: boolean;
    similar: boolean;
    partial: boolean;
  };
  similarityThreshold: number;
  minWordLength: number;
  ignoreCase: boolean;
  ignoreSpecialChars: boolean;
  ignorePunctuation: boolean;
  searchScope: 'all' | 'names' | 'descriptions';
  groupBy: 'category' | 'matchType' | 'similarity';
  minGroupSize: number;
}

export const defaultSearchOptions: DuplicateSearchOptions = {
  matchTypes: {
    exact: true,
    exactWords: true,
    similar: false,
    partial: false
  },
  similarityThreshold: 80,
  minWordLength: 3,
  ignoreCase: true,
  ignoreSpecialChars: true,
  ignorePunctuation: true,
  searchScope: 'all',
  groupBy: 'matchType',
  minGroupSize: 2
};

interface DuplicateSearchConfigProps {
  options: DuplicateSearchOptions;
  onOptionsChange: (options: DuplicateSearchOptions) => void;
}

export const DuplicateSearchConfig: React.FC<DuplicateSearchConfigProps> = ({
  options,
  onOptionsChange
}) => {
  const updateOptions = (updates: Partial<DuplicateSearchOptions>) => {
    onOptionsChange({ ...options, ...updates });
  };

  const updateMatchType = (type: keyof DuplicateSearchOptions['matchTypes'], enabled: boolean) => {
    updateOptions({
      matchTypes: {
        ...options.matchTypes,
        [type]: enabled
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Match Types
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select which types of matches to detect</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Exact Match</Label>
                <p className="text-sm text-gray-500">Identical text</p>
              </div>
              <Switch
                checked={options.matchTypes.exact}
                onCheckedChange={(checked) => updateMatchType('exact', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Exact Words</Label>
                <p className="text-sm text-gray-500">Same words, different order</p>
              </div>
              <Switch
                checked={options.matchTypes.exactWords}
                onCheckedChange={(checked) => updateMatchType('exactWords', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Similar Text</Label>
                <p className="text-sm text-gray-500">Text similarity algorithm</p>
              </div>
              <Switch
                checked={options.matchTypes.similar}
                onCheckedChange={(checked) => updateMatchType('similar', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Partial Match</Label>
                <p className="text-sm text-gray-500">Contains similar words</p>
              </div>
              <Switch
                checked={options.matchTypes.partial}
                onCheckedChange={(checked) => updateMatchType('partial', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Similarity Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <Label>Similarity Threshold</Label>
              <Badge variant="secondary">{options.similarityThreshold}%</Badge>
            </div>
            <Slider
              value={[options.similarityThreshold]}
              onValueChange={(value) => updateOptions({ similarityThreshold: value[0] })}
              min={50}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Higher values = more strict matching
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Minimum Word Length</Label>
              <Badge variant="secondary">{options.minWordLength}</Badge>
            </div>
            <Slider
              value={[options.minWordLength]}
              onValueChange={(value) => updateOptions({ minWordLength: value[0] })}
              min={2}
              max={6}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ignore words shorter than this length
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Minimum Group Size</Label>
              <Badge variant="secondary">{options.minGroupSize}</Badge>
            </div>
            <Slider
              value={[options.minGroupSize]}
              onValueChange={(value) => updateOptions({ minGroupSize: value[0] })}
              min={2}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum duplicates required to form a group
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Text Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Ignore Case</Label>
              <p className="text-sm text-gray-500">Case-insensitive matching</p>
            </div>
            <Switch
              checked={options.ignoreCase}
              onCheckedChange={(checked) => updateOptions({ ignoreCase: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Ignore Special Characters</Label>
              <p className="text-sm text-gray-500">Remove special chars (., -, _, etc.)</p>
            </div>
            <Switch
              checked={options.ignoreSpecialChars}
              onCheckedChange={(checked) => updateOptions({ ignoreSpecialChars: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Ignore Punctuation</Label>
              <p className="text-sm text-gray-500">Remove punctuation marks</p>
            </div>
            <Switch
              checked={options.ignorePunctuation}
              onCheckedChange={(checked) => updateOptions({ ignorePunctuation: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search & Display Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-medium mb-2 block">Search Scope</Label>
            <Select 
              value={options.searchScope} 
              onValueChange={(value: 'all' | 'names' | 'descriptions') => updateOptions({ searchScope: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Names & Descriptions</SelectItem>
                <SelectItem value="names">Names Only</SelectItem>
                <SelectItem value="descriptions">Descriptions Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-medium mb-2 block">Group Results By</Label>
            <Select 
              value={options.groupBy} 
              onValueChange={(value: 'category' | 'matchType' | 'similarity') => updateOptions({ groupBy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matchType">Match Type</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="similarity">Similarity Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
