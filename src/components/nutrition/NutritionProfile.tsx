import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, User, X } from 'lucide-react';
import { useNutritionProfile, useSaveNutritionProfile } from '@/hooks/useNutrition';

const DIETARY_STYLES = ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'mediterranean', 'flexitarian'];
const ALLERGY_OPTIONS = ['gluten', 'dairy', 'eggs', 'nuts', 'peanuts', 'soy', 'fish', 'shellfish', 'wheat', 'sesame'];
const BUDGET_LEVELS = ['budget', 'moderate', 'premium'];
const COOKING_LEVELS = ['none', 'beginner', 'intermediate', 'advanced'];

interface Props {
  clientId: string;
  shopId: string;
}

export default function NutritionProfile({ clientId, shopId }: Props) {
  const { data: existing, isLoading } = useNutritionProfile(clientId, shopId);
  const saveMutation = useSaveNutritionProfile(shopId);
  const [form, setForm] = useState<any>(null);

  React.useEffect(() => {
    if (existing && !form) {
      setForm(existing);
    }
  }, [existing]);

  const currentForm = form || {
    dietary_style: 'omnivore',
    allergies: [],
    intolerances: [],
    disliked_foods: [],
    digestive_notes: '',
    budget_level: 'moderate',
    cooking_level: 'intermediate',
    supplement_usage: [],
    meal_frequency: 3,
    snack_frequency: 1,
    hydration_goal_ml: 2500,
  };

  const toggleArrayItem = (field: string, item: string) => {
    const arr = currentForm[field] || [];
    const updated = arr.includes(item) ? arr.filter((i: string) => i !== item) : [...arr, item];
    setForm({ ...currentForm, [field]: updated });
  };

  const handleSave = () => {
    saveMutation.mutate({ ...currentForm, client_id: clientId });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Nutrition Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label>Dietary Style</Label>
          <Select value={currentForm.dietary_style} onValueChange={v => setForm({ ...currentForm, dietary_style: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DIETARY_STYLES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">Allergies</Label>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map(a => (
              <Badge
                key={a}
                variant={(currentForm.allergies || []).includes(a) ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => toggleArrayItem('allergies', a)}
              >
                {a}
                {(currentForm.allergies || []).includes(a) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Intolerances</Label>
          <div className="flex flex-wrap gap-2">
            {['lactose', 'fructose', 'histamine', 'fodmap', 'caffeine'].map(a => (
              <Badge
                key={a}
                variant={(currentForm.intolerances || []).includes(a) ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => toggleArrayItem('intolerances', a)}
              >
                {a}
                {(currentForm.intolerances || []).includes(a) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Budget Level</Label>
            <Select value={currentForm.budget_level} onValueChange={v => setForm({ ...currentForm, budget_level: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUDGET_LEVELS.map(b => <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cooking Level</Label>
            <Select value={currentForm.cooking_level} onValueChange={v => setForm({ ...currentForm, cooking_level: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COOKING_LEVELS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Meals/Day</Label>
            <Input type="number" min={1} max={8} value={currentForm.meal_frequency} onChange={e => setForm({ ...currentForm, meal_frequency: parseInt(e.target.value) || 3 })} />
          </div>
          <div>
            <Label>Snacks/Day</Label>
            <Input type="number" min={0} max={5} value={currentForm.snack_frequency} onChange={e => setForm({ ...currentForm, snack_frequency: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>Water (ml)</Label>
            <Input type="number" min={500} max={5000} step={250} value={currentForm.hydration_goal_ml} onChange={e => setForm({ ...currentForm, hydration_goal_ml: parseInt(e.target.value) || 2500 })} />
          </div>
        </div>

        <div>
          <Label>Digestive Notes</Label>
          <Textarea value={currentForm.digestive_notes || ''} onChange={e => setForm({ ...currentForm, digestive_notes: e.target.value })} placeholder="Any digestive issues, preferences, or notes..." rows={2} />
        </div>

        <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Profile
        </Button>
      </CardContent>
    </Card>
  );
}
