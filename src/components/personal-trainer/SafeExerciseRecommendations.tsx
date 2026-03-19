import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Dumbbell, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useExerciseSearch, useSafeExercises, getSafeBodyParts, getAvoidedBodyParts, ExerciseDBResult } from '@/hooks/useExerciseDB';

interface Props {
  restrictions: string[];
  conditions: Array<{ condition_name: string; exercise_restrictions: string[] }>;
}

function ExerciseCard({ exercise }: { exercise: ExerciseDBResult }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-start gap-3">
        {exercise.gifUrl && (
          <img 
            src={exercise.gifUrl} 
            alt={exercise.name} 
            className="w-16 h-16 rounded-md object-cover shrink-0"
            loading="lazy"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium capitalize">{exercise.name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {(exercise.bodyParts || []).map(bp => (
              <Badge key={bp} variant="outline" className="text-[10px] capitalize">{bp}</Badge>
            ))}
            {(exercise.targetMuscles || []).map(m => (
              <Badge key={m} variant="secondary" className="text-[10px] capitalize">{m}</Badge>
            ))}
          </div>
          {(exercise.equipments || []).length > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Equipment: {exercise.equipments.join(', ')}
            </p>
          )}
        </div>
      </div>
      
      {exercise.instructions?.length > 0 && (
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs px-2 gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? 'Hide' : 'Show'} Instructions
          </Button>
          {expanded && (
            <ol className="text-xs text-muted-foreground space-y-1 mt-1 pl-4 list-decimal">
              {exercise.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

export default function SafeExerciseRecommendations({ restrictions, conditions }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  
  const allRestrictions = useMemo(() => {
    const set = new Set<string>();
    restrictions.forEach(r => set.add(r));
    conditions.forEach(c => (c.exercise_restrictions || []).forEach(r => set.add(r)));
    return [...set];
  }, [restrictions, conditions]);
  
  const safeBodyParts = useMemo(() => getSafeBodyParts(allRestrictions), [allRestrictions]);
  const avoidedBodyParts = useMemo(() => getAvoidedBodyParts(allRestrictions), [allRestrictions]);
  
  const { results: searchResults, isLoading: searchLoading } = useExerciseSearch(searchQuery);
  const { results: bodyPartResults, isLoading: bodyPartLoading } = useSafeExercises(selectedBodyPart);
  
  // Filter search results to exclude exercises targeting avoided body parts
  const filteredSearchResults = useMemo(() => {
    if (!avoidedBodyParts.length) return searchResults;
    return searchResults.filter(ex => 
      !(ex.bodyParts || []).some(bp => avoidedBodyParts.includes(bp.toLowerCase()))
    );
  }, [searchResults, avoidedBodyParts]);
  
  const displayResults = searchQuery.length >= 2 ? filteredSearchResults : bodyPartResults;
  const isLoading = searchQuery.length >= 2 ? searchLoading : bodyPartLoading;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          Safe Exercise Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Restrictions summary */}
        {allRestrictions.length > 0 && (
          <div className="space-y-2">
            {avoidedBodyParts.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">Avoid:</span>
                  {avoidedBodyParts.map(bp => (
                    <Badge key={bp} variant="destructive" className="text-[10px] capitalize">{bp}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">Safe areas:</span>
                {safeBodyParts.map(bp => (
                  <Badge 
                    key={bp} 
                    variant={selectedBodyPart === bp ? 'default' : 'outline'} 
                    className="text-[10px] capitalize cursor-pointer"
                    onClick={() => {
                      setSelectedBodyPart(prev => prev === bp ? '' : bp);
                      setSearchQuery('');
                    }}
                  >
                    {bp}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search exercises (e.g., squat, curl, press)..." 
            value={searchQuery} 
            onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setSelectedBodyPart(''); }}
            className="pl-9"
          />
        </div>
        
        <p className="text-[11px] text-muted-foreground">
          Powered by ExerciseDB — exercises auto-filtered based on medical restrictions. Click a safe body part or search to explore.
        </p>
        
        {/* Results */}
        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-2 pr-2">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && displayResults.map(ex => (
              <ExerciseCard key={ex.exerciseId || ex.name} exercise={ex} />
            ))}
            {!isLoading && displayResults.length === 0 && (searchQuery.length >= 2 || selectedBodyPart) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No safe exercises found. Try a different search or body part.
              </p>
            )}
            {!isLoading && !searchQuery && !selectedBodyPart && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Select a safe body part above or search to find recommended exercises.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
