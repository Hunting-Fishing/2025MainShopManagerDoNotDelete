
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DuplicateSearchOptions } from '@/utils/search/duplicateSearch';

interface DuplicateSearchConfigProps {
  options: DuplicateSearchOptions;
  onOptionsChange: (options: DuplicateSearchOptions) => void;
}

export const DuplicateSearchConfig: React.FC<DuplicateSearchConfigProps> = ({
  options,
  onOptionsChange
}) => {
  const updateOption = (key: keyof DuplicateSearchOptions, value: any) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const updateMatchTypes = (type: string, checked: boolean) => {
    const newMatchTypes = checked 
      ? [...options.matchTypes, type]
      : options.matchTypes.filter(t => t !== type);
    updateOption('matchTypes', newMatchTypes);
  };

  const updateSearchScope = (scope: string, checked: boolean) => {
    const newScope = checked 
      ? [...options.searchScope, scope]
      : options.searchScope.filter(s => s !== scope);
    updateOption('searchScope', newScope);
  };

  return (
    <div className="space-y-6">
      {/* Match Types */}
      <Card>
        <CardHeader>
          <CardTitle>Match Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="exactMatch"
              checked={options.exactMatch}
              onCheckedChange={(checked) => updateOption('exactMatch', checked)}
            />
            <Label htmlFor="exactMatch">Exact Match</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="exactWords"
              checked={options.exactWords}
              onCheckedChange={(checked) => updateOption('exactWords', checked)}
            />
            <Label htmlFor="exactWords">Exact Words (different order)</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="similarMatch"
              checked={options.similarMatch}
              onCheckedChange={(checked) => updateOption('similarMatch', checked)}
            />
            <Label htmlFor="similarMatch">Similar Match</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="partialMatch"
              checked={options.partialMatch}
              onCheckedChange={(checked) => updateOption('partialMatch', checked)}
            />
            <Label htmlFor="partialMatch">Partial Match</Label>
          </div>
        </CardContent>
      </Card>

      {/* Similarity Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Similarity Threshold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Threshold: {options.similarityThreshold}</Label>
            <Slider
              value={[options.similarityThreshold]}
              onValueChange={([value]) => updateOption('similarityThreshold', value)}
              min={0.1}
              max={1.0}
              step={0.1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Text Processing */}
      <Card>
        <CardHeader>
          <CardTitle>Text Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="ignoreSpecialChars"
              checked={options.ignoreSpecialChars}
              onCheckedChange={(checked) => updateOption('ignoreSpecialChars', checked)}
            />
            <Label htmlFor="ignoreSpecialChars">Ignore Special Characters</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="ignorePunctuation"
              checked={options.ignorePunctuation}
              onCheckedChange={(checked) => updateOption('ignorePunctuation', checked)}
            />
            <Label htmlFor="ignorePunctuation">Ignore Punctuation</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minWordLength">Minimum Word Length</Label>
            <Input
              id="minWordLength"
              type="number"
              value={options.minWordLength}
              onChange={(e) => updateOption('minWordLength', parseInt(e.target.value) || 1)}
              min={1}
              max={10}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Scope */}
      <Card>
        <CardHeader>
          <CardTitle>Search Scope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {['categories', 'subcategories', 'jobs'].map((scope) => (
            <div key={scope} className="flex items-center space-x-2">
              <Checkbox
                id={scope}
                checked={options.searchScope.includes(scope)}
                onCheckedChange={(checked) => updateSearchScope(scope, !!checked)}
              />
              <Label htmlFor={scope} className="capitalize">{scope}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Grouping Options */}
      <Card>
        <CardHeader>
          <CardTitle>Grouping Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupBy">Group By</Label>
            <Select value={options.groupBy} onValueChange={(value) => updateOption('groupBy', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="similarity">Similarity</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minGroupSize">Minimum Group Size</Label>
            <Input
              id="minGroupSize"
              type="number"
              value={options.minGroupSize}
              onChange={(e) => updateOption('minGroupSize', parseInt(e.target.value) || 2)}
              min={2}
              max={10}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
