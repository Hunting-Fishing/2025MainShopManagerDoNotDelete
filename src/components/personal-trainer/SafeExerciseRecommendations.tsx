import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Dumbbell, ShieldCheck, ShieldAlert, AlertTriangle, XCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useExerciseSearch, getSafeBodyParts, getAvoidedBodyParts, ExerciseDBResult } from '@/hooks/useExerciseDB';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  shopId: string;
  restrictions: string[];
  conditions: Array<{ condition_name: string; exercise_restrictions: string[] }>;
}

type RiskTier = 'safe' | 'caution' | 'warning' | 'avoid';

interface ClassifiedExercise {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  description: string | null;
  instructions: string | null;
  tier: RiskTier;
  reason: string;
}

// Maps restriction keywords to exercise name patterns that should be flagged
const RESTRICTION_EXERCISE_PATTERNS: Record<string, string[]> = {
  no_heavy_deadlifts: ['deadlift', 'dead lift'],
  no_heavy_squats: ['squat', 'leg press'],
  no_overhead: ['overhead', 'military press', 'shoulder press', 'snatch', 'jerk'],
  no_spinal_loading: ['deadlift', 'squat', 'good morning', 'back extension', 'barbell row', 'clean'],
  no_bench_press: ['bench press'],
  no_pull_ups: ['pull up', 'pullup', 'chin up', 'chinup'],
  no_plyometrics: ['jump', 'box jump', 'plyometric', 'burpee'],
  no_running: ['run', 'sprint', 'jog', 'treadmill'],
  no_jumping: ['jump', 'box jump', 'plyometric', 'burpee', 'skip'],
  no_twisting: ['twist', 'rotation', 'russian twist', 'woodchop'],
  avoid_impact: ['jump', 'box jump', 'burpee', 'sprint'],
  no_grip_heavy: ['farmer', 'grip', 'wrist curl', 'hang'],
  seated_exercises_only: ['standing', 'lunge', 'step up'],
  no_lateral_movements: ['lateral', 'side step', 'carioca', 'shuffle'],
};

// Maps restriction keywords to muscle groups that should be avoided
const RESTRICTION_MUSCLE_GROUPS: Record<string, string[]> = {
  no_overhead: ['shoulders', 'deltoids'],
  no_heavy_squats: ['quadriceps', 'quads', 'glutes', 'legs'],
  no_heavy_deadlifts: ['back', 'hamstrings', 'lower back'],
  no_spinal_loading: ['back', 'lower back', 'erectors'],
  no_bench_press: ['chest', 'pectorals'],
  avoid_bending: ['lower back', 'back'],
  no_abdominal_exercises: ['abs', 'core', 'abdominals'],
  no_pull_ups: ['back', 'lats', 'biceps'],
};

// Muscle groups that are adjacent/related (for caution tier)
const ADJACENT_MUSCLES: Record<string, string[]> = {
  'back': ['shoulders', 'core', 'abs'],
  'lower back': ['core', 'abs', 'glutes', 'hamstrings'],
  'chest': ['shoulders', 'triceps'],
  'shoulders': ['chest', 'back', 'triceps'],
  'legs': ['glutes', 'calves', 'hamstrings', 'quadriceps'],
  'quadriceps': ['glutes', 'hamstrings', 'calves'],
  'hamstrings': ['glutes', 'quadriceps', 'lower back'],
};

const TIER_CONFIG: Record<RiskTier, { color: string; borderColor: string; icon: React.ReactNode; label: string }> = {
  safe: {
    color: 'text-green-600 dark:text-green-400',
    borderColor: 'border-l-green-500',
    icon: <ShieldCheck className="h-3.5 w-3.5 text-green-600" />,
    label: 'Safe',
  },
  caution: {
    color: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-l-yellow-500',
    icon: <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />,
    label: 'Caution',
  },
  warning: {
    color: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-l-orange-500',
    icon: <ShieldAlert className="h-3.5 w-3.5 text-orange-600" />,
    label: 'Warning',
  },
  avoid: {
    color: 'text-red-600 dark:text-red-400',
    borderColor: 'border-l-red-500',
    icon: <XCircle className="h-3.5 w-3.5 text-red-600" />,
    label: 'Avoid',
  },
};

function classifyExercise(
  exercise: { name: string; muscle_group: string | null; equipment: string | null },
  allRestrictions: string[],
  avoidedMuscleGroups: Set<string>,
  adjacentToAvoided: Set<string>
): { tier: RiskTier; reason: string } {
  const nameLower = exercise.name.toLowerCase();
  const muscleLower = (exercise.muscle_group || '').toLowerCase();

  // Check direct name pattern matches against restrictions (AVOID)
  for (const restriction of allRestrictions) {
    const patterns = RESTRICTION_EXERCISE_PATTERNS[restriction];
    if (patterns) {
      for (const pattern of patterns) {
        if (nameLower.includes(pattern)) {
          return { tier: 'avoid', reason: `Conflicts with ${restriction.replace(/_/g, ' ')}` };
        }
      }
    }
  }

  // Check if exercise targets an avoided muscle group (WARNING or AVOID)
  if (muscleLower) {
    for (const avoided of avoidedMuscleGroups) {
      if (muscleLower.includes(avoided) || avoided.includes(muscleLower)) {
        return { tier: 'warning', reason: `Targets restricted area: ${avoided}` };
      }
    }
  }

  // Check if exercise targets an adjacent muscle group (CAUTION)
  if (muscleLower) {
    for (const adj of adjacentToAvoided) {
      if (muscleLower.includes(adj) || adj.includes(muscleLower)) {
        return { tier: 'caution', reason: `Near restricted area: ${adj}` };
      }
    }
  }

  return { tier: 'safe', reason: 'No conflicts with current restrictions' };
}

function LocalExerciseCard({ exercise }: { exercise: ClassifiedExercise }) {
  const [expanded, setExpanded] = useState(false);
  const config = TIER_CONFIG[exercise.tier];

  return (
    <div className={`border rounded-lg border-l-4 ${config.borderColor} ${exercise.tier === 'avoid' ? 'opacity-60' : ''}`}>
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {config.icon}
              <span className="text-sm font-medium capitalize">{exercise.name}</span>
              <Badge
                variant="outline"
                className={`text-[10px] ${config.color}`}
              >
                {config.label}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {exercise.muscle_group && (
                <Badge variant="secondary" className="text-[10px] capitalize">{exercise.muscle_group}</Badge>
              )}
              {exercise.equipment && (
                <Badge variant="outline" className="text-[10px] capitalize">{exercise.equipment}</Badge>
              )}
              {exercise.difficulty && (
                <Badge variant="outline" className="text-[10px] capitalize">{exercise.difficulty}</Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 italic">{exercise.reason}</p>
          </div>
        </div>

        {(exercise.instructions || exercise.description) && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Hide' : 'Show'} Details
            </Button>
            {expanded && (
              <div className="text-xs text-muted-foreground mt-1 pl-2 space-y-1">
                {exercise.description && <p>{exercise.description}</p>}
                {exercise.instructions && <p>{exercise.instructions}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ExternalExerciseCard({ exercise }: { exercise: ExerciseDBResult }) {
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
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1" onClick={() => setExpanded(!expanded)}>
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

export default function SafeExerciseRecommendations({ shopId, restrictions, conditions }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showExplore, setShowExplore] = useState(false);
  const [localExercises, setLocalExercises] = useState<any[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [showAvoid, setShowAvoid] = useState(false);

  const allRestrictions = useMemo(() => {
    const set = new Set<string>();
    restrictions.forEach(r => set.add(r));
    conditions.forEach(c => (c.exercise_restrictions || []).forEach(r => set.add(r)));
    return [...set];
  }, [restrictions, conditions]);

  const safeBodyParts = useMemo(() => getSafeBodyParts(allRestrictions), [allRestrictions]);
  const avoidedBodyParts = useMemo(() => getAvoidedBodyParts(allRestrictions), [allRestrictions]);

  // Build avoided muscle group set from restrictions
  const avoidedMuscleGroups = useMemo(() => {
    const avoided = new Set<string>();
    for (const r of allRestrictions) {
      const groups = RESTRICTION_MUSCLE_GROUPS[r];
      if (groups) groups.forEach(g => avoided.add(g));
    }
    return avoided;
  }, [allRestrictions]);

  // Build adjacent-to-avoided set
  const adjacentToAvoided = useMemo(() => {
    const adj = new Set<string>();
    for (const avoided of avoidedMuscleGroups) {
      const related = ADJACENT_MUSCLES[avoided];
      if (related) related.forEach(r => { if (!avoidedMuscleGroups.has(r)) adj.add(r); });
    }
    return adj;
  }, [avoidedMuscleGroups]);

  // Load local exercises from pt_exercises
  useEffect(() => {
    if (!shopId) return;
    setLocalLoading(true);
    (supabase as any)
      .from('pt_exercises')
      .select('id, name, muscle_group, equipment, difficulty, description, instructions')
      .eq('shop_id', shopId)
      .order('name')
      .then(({ data, error }: any) => {
        if (!error && data) setLocalExercises(data);
        setLocalLoading(false);
      });
  }, [shopId]);

  // Classify all local exercises
  const classifiedExercises = useMemo<ClassifiedExercise[]>(() => {
    return localExercises.map(ex => {
      const { tier, reason } = classifyExercise(ex, allRestrictions, avoidedMuscleGroups, adjacentToAvoided);
      return { ...ex, tier, reason };
    });
  }, [localExercises, allRestrictions, avoidedMuscleGroups, adjacentToAvoided]);

  // Group by tier
  const grouped = useMemo(() => {
    const groups: Record<RiskTier, ClassifiedExercise[]> = { safe: [], caution: [], warning: [], avoid: [] };
    classifiedExercises.forEach(ex => groups[ex.tier].push(ex));
    return groups;
  }, [classifiedExercises]);

  // ExerciseDB search (secondary)
  const { results: searchResults, isLoading: searchLoading } = useExerciseSearch(showExplore ? searchQuery : '');
  const filteredSearchResults = useMemo(() => {
    if (!avoidedBodyParts.length) return searchResults;
    return searchResults.filter(ex =>
      !(ex.bodyParts || []).some(bp => avoidedBodyParts.includes(bp.toLowerCase()))
    );
  }, [searchResults, avoidedBodyParts]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          Safe Exercise Recommendations
          {!localLoading && (
            <Badge variant="outline" className="text-[10px] ml-auto font-normal">
              {grouped.safe.length} safe · {grouped.caution.length} caution · {grouped.warning.length} warning · {grouped.avoid.length} avoid
            </Badge>
          )}
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
                  <Badge key={bp} variant="outline" className="text-[10px] capitalize">{bp}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Local exercises auto-loaded */}
        {localLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Safe exercises */}
            {grouped.safe.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium flex items-center gap-1.5 text-green-600">
                  <ShieldCheck className="h-3.5 w-3.5" /> Safe ({grouped.safe.length})
                </p>
                <div className="space-y-1.5 max-h-[30vh] overflow-y-auto pr-1">
                  {grouped.safe.map(ex => <LocalExerciseCard key={ex.id} exercise={ex} />)}
                </div>
              </div>
            )}

            {/* Caution exercises */}
            {grouped.caution.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium flex items-center gap-1.5 text-yellow-600">
                  <AlertTriangle className="h-3.5 w-3.5" /> Caution ({grouped.caution.length})
                </p>
                <div className="space-y-1.5 max-h-[25vh] overflow-y-auto pr-1">
                  {grouped.caution.map(ex => <LocalExerciseCard key={ex.id} exercise={ex} />)}
                </div>
              </div>
            )}

            {/* Warning exercises */}
            {grouped.warning.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium flex items-center gap-1.5 text-orange-600">
                  <ShieldAlert className="h-3.5 w-3.5" /> Warning ({grouped.warning.length})
                </p>
                <div className="space-y-1.5 max-h-[20vh] overflow-y-auto pr-1">
                  {grouped.warning.map(ex => <LocalExerciseCard key={ex.id} exercise={ex} />)}
                </div>
              </div>
            )}

            {/* Avoid exercises - collapsed by default */}
            {grouped.avoid.length > 0 && (
              <div className="space-y-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2 gap-1.5 text-red-600"
                  onClick={() => setShowAvoid(!showAvoid)}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Avoid ({grouped.avoid.length}) — Not Recommended
                  {showAvoid ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
                {showAvoid && (
                  <div className="space-y-1.5 max-h-[20vh] overflow-y-auto pr-1">
                    {grouped.avoid.map(ex => <LocalExerciseCard key={ex.id} exercise={ex} />)}
                  </div>
                )}
              </div>
            )}

            {classifiedExercises.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No exercises found in your library. Add exercises to your library first.
              </p>
            )}
          </div>
        )}

        {/* Explore more via ExerciseDB */}
        <div className="border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => setShowExplore(!showExplore)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {showExplore ? 'Hide' : 'Explore More'} from ExerciseDB
            {showExplore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>

          {showExplore && (
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">Browse safe areas:</span>
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
                Powered by ExerciseDB — auto-filtered based on medical restrictions.
              </p>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {searchLoading && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!searchLoading && filteredSearchResults.map(ex => (
                  <ExternalExerciseCard key={ex.exerciseId || ex.name} exercise={ex} />
                ))}
                {!searchLoading && filteredSearchResults.length === 0 && searchQuery.length >= 2 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No safe exercises found. Try a different search.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
