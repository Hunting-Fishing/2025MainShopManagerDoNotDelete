
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { DuplicateSearchOptions } from '@/utils/search/duplicateSearch';
import { Settings, Target, Percent, Type } from 'lucide-react';

interface DuplicateSearchConfigProps {
  options: DuplicateSearchOptions;
  onOptionsChange: (options: DuplicateSearchOptions) => void;
}

export const DuplicateSearchConfig: React.FC<DuplicateSearchConfigProps> = ({
  options,
  onOptionsChange
}) => {
  const updateOption = (key: keyof DuplicateSearchOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Duplicate Search Configuration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Matching Types */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            <Label className="text-sm font-semibold">Matching Types</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="exact-match" className="text-sm font-medium">
                  Exact Match
                </Label>
                <p className="text-xs text-gray-600">
                  Find items with identical names
                </p>
              </div>
              <Switch
                id="exact-match"
                checked={options.exactMatch}
                onCheckedChange={(checked) => updateOption('exactMatch', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="exact-words" className="text-sm font-medium">
                  Exact Words
                </Label>
                <p className="text-xs text-gray-600">
                  Match items with same words in any order
                </p>
              </div>
              <Switch
                id="exact-words"
                checked={options.exactWords}
                onCheckedChange={(checked) => updateOption('exactWords', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="partial-match" className="text-sm font-medium">
                  Partial Match
                </Label>
                <p className="text-xs text-gray-600">
                  Find items with partial similarities
                </p>
              </div>
              <Switch
                id="partial-match"
                checked={options.partialMatch}
                onCheckedChange={(checked) => updateOption('partialMatch', checked)}
              />
            </div>
          </div>
        </div>

        {/* Similarity Threshold */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-orange-600" />
            <Label className="text-sm font-semibold">Similarity Threshold</Label>
            <Badge variant="outline">{options.similarityThreshold}%</Badge>
          </div>
          
          <div className="px-2">
            <Slider
              value={[options.similarityThreshold]}
              onValueChange={([value]) => updateOption('similarityThreshold', value)}
              max={100}
              min={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50% (Loose)</span>
              <span>75% (Medium)</span>
              <span>100% (Strict)</span>
            </div>
          </div>
        </div>

        {/* Text Processing Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-purple-600" />
            <Label className="text-sm font-semibold">Text Processing</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="ignore-case" className="text-sm font-medium">
                  Ignore Case
                </Label>
                <p className="text-xs text-gray-600">
                  Case-insensitive matching
                </p>
              </div>
              <Switch
                id="ignore-case"
                checked={options.ignoreCase}
                onCheckedChange={(checked) => updateOption('ignoreCase', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="ignore-punctuation" className="text-sm font-medium">
                  Ignore Punctuation
                </Label>
                <p className="text-xs text-gray-600">
                  Remove punctuation before matching
                </p>
              </div>
              <Switch
                id="ignore-punctuation"
                checked={options.ignorePunctuation}
                onCheckedChange={(checked) => updateOption('ignorePunctuation', checked)}
              />
            </div>
          </div>
        </div>

        {/* Minimum Word Length */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-semibold">Minimum Word Length</Label>
            <Badge variant="outline">{options.minWordLength} characters</Badge>
          </div>
          
          <div className="px-2">
            <Slider
              value={[options.minWordLength]}
              onValueChange={([value]) => updateOption('minWordLength', value)}
              max={6}
              min={2}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2 chars</span>
              <span>4 chars</span>
              <span>6 chars</span>
            </div>
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="pt-4 border-t">
          <Label className="text-sm font-semibold mb-2 block">Active Filters</Label>
          <div className="flex flex-wrap gap-2">
            {options.exactMatch && <Badge variant="secondary">Exact Match</Badge>}
            {options.exactWords && <Badge variant="secondary">Exact Words</Badge>}
            {options.partialMatch && <Badge variant="secondary">Partial Match</Badge>}
            <Badge variant="outline">≥{options.similarityThreshold}% similar</Badge>
            {options.ignoreCase && <Badge variant="outline">Case insensitive</Badge>}
            {options.ignorePunctuation && <Badge variant="outline">No punctuation</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
