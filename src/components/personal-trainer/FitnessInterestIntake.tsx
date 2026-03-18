import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, Check, ChevronRight, ChevronLeft, Search, Sparkles, Target, Dumbbell, Heart, Zap, Footprints, Mountain, Trophy, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useFitnessCategories,
  useFitnessSubcategories,
  useFitnessGoals,
  useClientFitnessProfile,
  useSaveFitnessProfile,
  FitnessCategory,
  FitnessSubcategory,
} from '@/hooks/useFitnessTaxonomy';
import { useToast } from '@/hooks/use-toast';

const ICON_MAP: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell className="h-5 w-5" />,
  Flame: <Zap className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Footprints: <Footprints className="h-5 w-5" />,
  Bike: <Zap className="h-5 w-5" />,
  Waves: <Heart className="h-5 w-5" />,
  PersonStanding: <Target className="h-5 w-5" />,
  Swords: <Shield className="h-5 w-5" />,
  StretchHorizontal: <Heart className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Music: <Sparkles className="h-5 w-5" />,
  Mountain: <Mountain className="h-5 w-5" />,
  Trophy: <Trophy className="h-5 w-5" />,
  HeartPulse: <Heart className="h-5 w-5" />,
  TrendingDown: <Target className="h-5 w-5" />,
  Users: <Target className="h-5 w-5" />,
  ShieldCheck: <Shield className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
  Scale: <Target className="h-5 w-5" />,
};

const EXPERIENCE_LEVELS = [
  { value: 'complete_beginner', label: 'Complete Beginner', desc: 'Never trained before' },
  { value: 'beginner', label: 'Beginner', desc: '0-6 months experience' },
  { value: 'intermediate', label: 'Intermediate', desc: '6 months - 2 years' },
  { value: 'advanced', label: 'Advanced', desc: '2-5+ years consistent' },
  { value: 'elite', label: 'Elite / Competitive', desc: 'Competition level' },
];

const TRAINING_ENVIRONMENTS = [
  'Commercial Gym', 'Home Gym', 'Outdoor', 'Studio', 'CrossFit Box',
  'Swimming Pool', 'Track / Field', 'Park', 'Office / Workplace',
];

const EQUIPMENT_OPTIONS = [
  'No Equipment', 'Dumbbells', 'Barbell & Plates', 'Kettlebells', 'Resistance Bands',
  'Pull-Up Bar', 'Cable Machine', 'Rowing Machine', 'Treadmill', 'Bike / Spin Bike',
  'TRX / Suspension', 'Gymnastics Rings', 'Medicine Balls', 'Battle Ropes', 'Boxes / Steps',
];

const MOTIVATION_STYLES = [
  { value: 'accountability', label: 'Accountability Partner' },
  { value: 'data_driven', label: 'Data & Progress Tracking' },
  { value: 'community', label: 'Community & Social' },
  { value: 'competition', label: 'Competition & Challenges' },
  { value: 'routine', label: 'Structured Routine' },
  { value: 'variety', label: 'Variety & Fun' },
  { value: 'self_motivated', label: 'Self-Motivated / Independent' },
];

const SESSION_LENGTHS = [
  { value: '15-30', label: '15–30 min' },
  { value: '30-45', label: '30–45 min' },
  { value: '45-60', label: '45–60 min' },
  { value: '60-90', label: '60–90 min' },
  { value: '90+', label: '90+ min' },
];

const TRAINING_FREQUENCIES = [
  { value: '1-2', label: '1–2x / week' },
  { value: '3-4', label: '3–4x / week' },
  { value: '5-6', label: '5–6x / week' },
  { value: '7+', label: 'Daily / 7x' },
];

interface FitnessInterestIntakeProps {
  clientId: string;
  shopId: string;
  onComplete?: () => void;
  embedded?: boolean;
}

export default function FitnessInterestIntake({ clientId, shopId, onComplete, embedded = false }: FitnessInterestIntakeProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form state
  const [primaryInterests, setPrimaryInterests] = useState<string[]>([]);
  const [specificInterests, setSpecificInterests] = useState<string[]>([]);
  const [goalTags, setGoalTags] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [trainingEnvironment, setTrainingEnvironment] = useState<string[]>([]);
  const [equipmentAccess, setEquipmentAccess] = useState<string[]>([]);
  const [injuriesLimitations, setInjuriesLimitations] = useState('');
  const [motivationStyle, setMotivationStyle] = useState('');
  const [preferredSessionLength, setPreferredSessionLength] = useState('');
  const [trainingFrequency, setTrainingFrequency] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // Data hooks
  const { data: categories = [], isLoading: loadingCats } = useFitnessCategories();
  const { data: subcategories = [], isLoading: loadingSubs } = useFitnessSubcategories(primaryInterests);
  const { data: goals = [], isLoading: loadingGoals } = useFitnessGoals();
  const { data: existingProfile } = useClientFitnessProfile(clientId, shopId);
  const saveMutation = useSaveFitnessProfile();

  // Pre-populate from existing profile
  useEffect(() => {
    if (existingProfile) {
      setPrimaryInterests(existingProfile.primary_interests || []);
      setSpecificInterests(existingProfile.specific_interests || []);
      setGoalTags(existingProfile.goal_tags || []);
      setExperienceLevel(existingProfile.experience_level || 'beginner');
      setTrainingEnvironment(existingProfile.training_environment || []);
      setEquipmentAccess(existingProfile.equipment_access || []);
      setInjuriesLimitations(existingProfile.injuries_limitations || '');
      setMotivationStyle(existingProfile.motivation_style || '');
      setPreferredSessionLength(existingProfile.preferred_session_length || '');
      setTrainingFrequency(existingProfile.training_frequency || '');
    }
  }, [existingProfile]);

  const toggleInArray = (arr: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>, max?: number) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else if (!max || arr.length < max) {
      setter([...arr, item]);
    }
  };

  const filteredSubcategories = subcategories.filter(s =>
    !subSearch || s.name.toLowerCase().includes(subSearch.toLowerCase())
  );

  // Group subcategories by category
  const groupedSubs = filteredSubcategories.reduce<Record<string, FitnessSubcategory[]>>((acc, sub) => {
    if (!acc[sub.category_id]) acc[sub.category_id] = [];
    acc[sub.category_id].push(sub);
    return acc;
  }, {});

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        client_id: clientId,
        shop_id: shopId,
        primary_interests: primaryInterests,
        specific_interests: specificInterests,
        goal_tags: goalTags,
        experience_level: experienceLevel,
        training_environment: trainingEnvironment,
        equipment_access: equipmentAccess,
        injuries_limitations: injuriesLimitations || null,
        motivation_style: motivationStyle || null,
        preferred_session_length: preferredSessionLength || null,
        training_frequency: trainingFrequency || null,
        intake_completed: true,
        intake_completed_at: new Date().toISOString(),
      });
      toast({ title: 'Fitness Profile Saved', description: 'Your fitness interests have been recorded successfully.' });
      onComplete?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save fitness profile.', variant: 'destructive' });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return primaryInterests.length >= 1;
      case 2: return true; // optional
      case 3: return goalTags.length >= 1;
      case 4: return !!experienceLevel;
      case 5: return true;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return renderStep1PrimaryIdentity();
      case 2: return renderStep2SpecificInterests();
      case 3: return renderStep3Goals();
      case 4: return renderStep4Profile();
      case 5: return renderStep5Summary();
      default: return null;
    }
  };

  const renderStep1PrimaryIdentity = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">What type of training are you into?</h2>
        <p className="text-sm text-muted-foreground">Choose 1–3 primary identities that describe your fitness focus</p>
      </div>
      {loadingCats ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const selected = primaryInterests.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleInArray(primaryInterests, cat.id, setPrimaryInterests, 3)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                  selected
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                  selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )} style={selected && cat.color ? { backgroundColor: cat.color } : {}}>
                  {ICON_MAP[cat.icon || ''] || <Sparkles className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className={cn('font-semibold text-sm truncate', selected ? 'text-primary' : 'text-foreground')}>
                    {cat.name.split(' / ')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                </div>
                {selected && <Check className="h-5 w-5 text-primary shrink-0 ml-auto" />}
              </button>
            );
          })}
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        {primaryInterests.length}/3 selected
      </p>
    </div>
  );

  const renderStep2SpecificInterests = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Get more specific</h2>
        <p className="text-sm text-muted-foreground">Select the subcategories that match your interests</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search interests..."
          value={subSearch}
          onChange={(e) => setSubSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {loadingSubs ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : primaryInterests.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Select primary interests first</p>
      ) : (
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-1">
          {Object.entries(groupedSubs).map(([catId, subs]) => {
            const cat = categories.find(c => c.id === catId);
            return (
              <div key={catId}>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-muted" style={cat?.color ? { backgroundColor: cat.color + '20' } : {}}>
                    {ICON_MAP[cat?.icon || ''] || <Sparkles className="h-3 w-3" />}
                  </div>
                  {cat?.name.split(' / ')[0]}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subs.map(sub => {
                    const selected = specificInterests.includes(sub.id);
                    return (
                      <Badge
                        key={sub.id}
                        variant={selected ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-all px-3 py-1.5 text-xs',
                          selected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted'
                        )}
                        onClick={() => toggleInArray(specificInterests, sub.id, setSpecificInterests)}
                      >
                        {selected && <Check className="h-3 w-3 mr-1" />}
                        {sub.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        {specificInterests.length} interests selected
      </p>
    </div>
  );

  const renderStep3Goals = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">What are your goals?</h2>
        <p className="text-sm text-muted-foreground">Separate what you enjoy from what you want to achieve</p>
      </div>
      {loadingGoals ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {goals.map(goal => {
            const selected = goalTags.includes(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => toggleInArray(goalTags, goal.id, setGoalTags)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
                  selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {ICON_MAP[goal.icon || ''] || <Target className="h-4 w-4" />}
                </div>
                <span className={cn('font-medium text-sm', selected ? 'text-primary' : 'text-foreground')}>
                  {goal.name}
                </span>
                {selected && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStep4Profile = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Tell us more about you</h2>
        <p className="text-sm text-muted-foreground">Help us personalize your experience</p>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <Label className="font-semibold">Experience Level</Label>
        <div className="grid grid-cols-1 gap-2">
          {EXPERIENCE_LEVELS.map(lvl => (
            <button
              key={lvl.value}
              onClick={() => setExperienceLevel(lvl.value)}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all text-left',
                experienceLevel === lvl.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <div>
                <p className="font-medium text-sm">{lvl.label}</p>
                <p className="text-xs text-muted-foreground">{lvl.desc}</p>
              </div>
              {experienceLevel === lvl.value && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Training Environment */}
      <div className="space-y-2">
        <Label className="font-semibold">Training Environment</Label>
        <div className="flex flex-wrap gap-2">
          {TRAINING_ENVIRONMENTS.map(env => (
            <Badge
              key={env}
              variant={trainingEnvironment.includes(env) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer px-3 py-1.5 text-xs transition-all',
                trainingEnvironment.includes(env) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              onClick={() => toggleInArray(trainingEnvironment, env, setTrainingEnvironment)}
            >
              {trainingEnvironment.includes(env) && <Check className="h-3 w-3 mr-1" />}
              {env}
            </Badge>
          ))}
        </div>
      </div>

      {/* Equipment Access */}
      <div className="space-y-2">
        <Label className="font-semibold">Equipment Access</Label>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map(eq => (
            <Badge
              key={eq}
              variant={equipmentAccess.includes(eq) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer px-3 py-1.5 text-xs transition-all',
                equipmentAccess.includes(eq) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              onClick={() => toggleInArray(equipmentAccess, eq, setEquipmentAccess)}
            >
              {equipmentAccess.includes(eq) && <Check className="h-3 w-3 mr-1" />}
              {eq}
            </Badge>
          ))}
        </div>
      </div>

      {/* Session Length & Frequency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-semibold">Session Length</Label>
          <Select value={preferredSessionLength} onValueChange={setPreferredSessionLength}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {SESSION_LENGTHS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-semibold">Training Frequency</Label>
          <Select value={trainingFrequency} onValueChange={setTrainingFrequency}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {TRAINING_FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Motivation Style */}
      <div className="space-y-2">
        <Label className="font-semibold">Motivation Style</Label>
        <Select value={motivationStyle} onValueChange={setMotivationStyle}>
          <SelectTrigger><SelectValue placeholder="What keeps you going?" /></SelectTrigger>
          <SelectContent>
            {MOTIVATION_STYLES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Injuries */}
      <div className="space-y-2">
        <Label className="font-semibold">Injuries / Limitations</Label>
        <Textarea
          value={injuriesLimitations}
          onChange={(e) => setInjuriesLimitations(e.target.value)}
          placeholder="List any injuries, conditions, or physical limitations..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep5Summary = () => {
    const selectedCats = categories.filter(c => primaryInterests.includes(c.id));
    const selectedSubs = subcategories.filter(s => specificInterests.includes(s.id));
    const selectedGoals = goals.filter(g => goalTags.includes(g.id));
    const expLabel = EXPERIENCE_LEVELS.find(e => e.value === experienceLevel)?.label || experienceLevel;

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Your Fitness Profile</h2>
          <p className="text-sm text-muted-foreground">Review and confirm your selections</p>
        </div>

        <div className="space-y-4">
          <SummarySection title="Primary Interests" items={selectedCats.map(c => c.name.split(' / ')[0])} color="bg-primary" />
          {selectedSubs.length > 0 && <SummarySection title="Specific Interests" items={selectedSubs.map(s => s.name)} color="bg-blue-500" />}
          <SummarySection title="Goals" items={selectedGoals.map(g => g.name)} color="bg-green-500" />

          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Experience" value={expLabel} />
            <SummaryCard label="Session Length" value={SESSION_LENGTHS.find(s => s.value === preferredSessionLength)?.label || '—'} />
            <SummaryCard label="Frequency" value={TRAINING_FREQUENCIES.find(f => f.value === trainingFrequency)?.label || '—'} />
            <SummaryCard label="Motivation" value={MOTIVATION_STYLES.find(m => m.value === motivationStyle)?.label || '—'} />
          </div>

          {trainingEnvironment.length > 0 && <SummarySection title="Environment" items={trainingEnvironment} color="bg-orange-500" />}
          {equipmentAccess.length > 0 && <SummarySection title="Equipment" items={equipmentAccess} color="bg-purple-500" />}
          {injuriesLimitations && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Injuries / Limitations</p>
              <p className="text-sm text-foreground">{injuriesLimitations}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Wrapper = embedded ? 'div' : Card;
  const ContentWrapper = embedded ? 'div' : CardContent;

  return (
    <Wrapper className={cn(!embedded && 'max-w-2xl mx-auto shadow-xl border-0')}>
      <ContentWrapper className={cn(!embedded && 'p-6', 'space-y-6')}>
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="gap-1 bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Profile
            </Button>
          )}
        </div>
      </ContentWrapper>
    </Wrapper>
  );
}

function SummarySection({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => (
          <Badge key={item} className={cn(color, 'text-white text-xs px-2 py-0.5')}>{item}</Badge>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm text-foreground">{value}</p>
    </div>
  );
}
