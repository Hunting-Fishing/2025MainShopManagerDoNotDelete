import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Droplets, Utensils, AlertTriangle, User, Dumbbell, Heart, Phone, StickyNote } from 'lucide-react';

const WORKOUT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
}

interface ClientIntakeFormProps {
  trainers: Trainer[];
  isPending: boolean;
  onSubmit: (payload: Record<string, any>) => void;
}

const initialForm = {
  first_name: '', last_name: '', email: '', phone: '', gender: '',
  fitness_level: 'beginner', goals: '', health_conditions: '', membership_type: 'standard',
  date_of_birth: '', height_cm: '', weight_kg: '', injuries: '',
  emergency_contact: '', emergency_phone: '', preferred_workout_days: [] as string[],
  body_fat_percent: '', join_date: '',
  calorie_target: '', protein_target_g: '', carb_target_g: '', fat_target_g: '',
  hydration_target_ml: '', food_habits: '', supplement_notes: '', meal_guidance: '',
  notes: '',
};

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-3 pb-1 border-b border-border/50">
      <Icon className="h-4 w-4 text-primary" />
      <p className="text-xs font-semibold text-primary uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default function ClientIntakeForm({ trainers, isPending, onSubmit }: ClientIntakeFormProps) {
  const [form, setForm] = useState(initialForm);
  const [assignTrainer, setAssignTrainer] = useState('none');

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      preferred_workout_days: f.preferred_workout_days.includes(day)
        ? f.preferred_workout_days.filter(d => d !== day)
        : [...f.preferred_workout_days, day],
    }));
  };

  const handleSubmit = () => {
    onSubmit({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || null,
      phone: form.phone || null,
      gender: form.gender || null,
      fitness_level: form.fitness_level,
      goals: form.goals || null,
      health_conditions: form.health_conditions || null,
      membership_type: form.membership_type,
      date_of_birth: form.date_of_birth || null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      body_fat_percent: form.body_fat_percent ? parseFloat(form.body_fat_percent) : null,
      injuries: form.injuries || null,
      emergency_contact: form.emergency_contact || null,
      emergency_phone: form.emergency_phone || null,
      preferred_workout_days: form.preferred_workout_days.length > 0 ? form.preferred_workout_days : null,
      trainer_id: assignTrainer && assignTrainer !== 'none' ? assignTrainer : null,
      join_date: form.join_date || null,
      calorie_target: form.calorie_target ? parseInt(form.calorie_target) : null,
      protein_target_g: form.protein_target_g ? parseInt(form.protein_target_g) : null,
      carb_target_g: form.carb_target_g ? parseInt(form.carb_target_g) : null,
      fat_target_g: form.fat_target_g ? parseInt(form.fat_target_g) : null,
      hydration_target_ml: form.hydration_target_ml ? parseInt(form.hydration_target_ml) : null,
      food_habits: form.food_habits || null,
      supplement_notes: form.supplement_notes || null,
      meal_guidance: form.meal_guidance || null,
      notes: form.notes || null,
    });
  };

  return (
    <div className="space-y-4">
      {/* ─── 1. Personal Info ─── */}
      <SectionHeader icon={User} label="Personal Info" />
      <div className="grid grid-cols-2 gap-3">
        <div><Label>First Name *</Label><Input value={form.first_name} onChange={e => set('first_name', e.target.value)} /></div>
        <div><Label>Last Name *</Label><Input value={form.last_name} onChange={e => set('last_name', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} /></div>
        <div>
          <Label>Sex</Label>
          <Select value={form.gender} onValueChange={v => set('gender', v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Height (cm)</Label><Input type="number" value={form.height_cm} onChange={e => set('height_cm', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Weight (kg)</Label><Input type="number" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} /></div>
        <div><Label>Body Fat %</Label><Input type="number" step="0.1" value={form.body_fat_percent} onChange={e => set('body_fat_percent', e.target.value)} placeholder="e.g. 18.5" /></div>
        <div>
          <Label>Fitness Level</Label>
          <Select value={form.fitness_level} onValueChange={v => set('fitness_level', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ─── 2. Membership & Training ─── */}
      <SectionHeader icon={Dumbbell} label="Membership & Training" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Membership Type</Label>
          <Select value={form.membership_type} onValueChange={v => set('membership_type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Join Date</Label><Input type="date" value={form.join_date} onChange={e => set('join_date', e.target.value)} /></div>
      </div>
      {trainers.length > 0 && (
        <div>
          <Label>Assign Trainer</Label>
          <Select value={assignTrainer} onValueChange={setAssignTrainer}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {trainers.map(t => <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label>Preferred Workout Days</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {WORKOUT_DAYS.map(day => (
            <Button key={day} type="button" size="sm" variant={form.preferred_workout_days.includes(day) ? 'default' : 'outline'} className="text-xs h-7" onClick={() => toggleDay(day)}>
              {day.slice(0, 3)}
            </Button>
          ))}
        </div>
      </div>

      {/* ─── 3. Health & Medical ─── */}
      <SectionHeader icon={Heart} label="Health & Medical" />
      <div><Label>Goals</Label><Textarea value={form.goals} onChange={e => set('goals', e.target.value)} placeholder="Weight loss, muscle gain, etc." /></div>
      <div><Label>Injuries / Limitations</Label><Textarea value={form.injuries} onChange={e => set('injuries', e.target.value)} placeholder="Knee injury, lower back issues..." /></div>
      <div><Label>Medical Warnings / Health Conditions</Label><Textarea value={form.health_conditions} onChange={e => set('health_conditions', e.target.value)} placeholder="Asthma, diabetes, heart conditions..." /></div>
      <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
        <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
        Detailed medical conditions can be added from the client profile after creation.
      </p>

      {/* ─── 4. Nutrition & Diet ─── */}
      <SectionHeader icon={Utensils} label="Nutrition & Diet" />
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Calorie Target</Label><Input type="number" value={form.calorie_target} onChange={e => set('calorie_target', e.target.value)} placeholder="e.g. 2200" /></div>
        <div className="flex items-end gap-1">
          <Droplets className="h-4 w-4 text-blue-500 mb-2.5 shrink-0" />
          <div className="flex-1"><Label>Hydration Target (ml)</Label><Input type="number" value={form.hydration_target_ml} onChange={e => set('hydration_target_ml', e.target.value)} placeholder="e.g. 3000" /></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Protein (g)</Label><Input type="number" value={form.protein_target_g} onChange={e => set('protein_target_g', e.target.value)} placeholder="150" /></div>
        <div><Label>Carbs (g)</Label><Input type="number" value={form.carb_target_g} onChange={e => set('carb_target_g', e.target.value)} placeholder="200" /></div>
        <div><Label>Fat (g)</Label><Input type="number" value={form.fat_target_g} onChange={e => set('fat_target_g', e.target.value)} placeholder="70" /></div>
      </div>
      <div><Label>Food Habits / Dietary Restrictions</Label><Textarea value={form.food_habits} onChange={e => set('food_habits', e.target.value)} placeholder="Vegetarian, no dairy, keto..." /></div>
      <div><Label>Supplement Notes</Label><Textarea value={form.supplement_notes} onChange={e => set('supplement_notes', e.target.value)} placeholder="Whey protein, creatine, multivitamin..." /></div>
      <div><Label>Meal Guidance</Label><Textarea value={form.meal_guidance} onChange={e => set('meal_guidance', e.target.value)} placeholder="5 meals/day, high protein breakfast..." /></div>

      {/* ─── 5. Emergency Contact ─── */}
      <SectionHeader icon={Phone} label="Emergency Contact" />
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Contact Name</Label><Input value={form.emergency_contact} onChange={e => set('emergency_contact', e.target.value)} /></div>
        <div><Label>Contact Phone</Label><Input value={form.emergency_phone} onChange={e => set('emergency_phone', e.target.value)} /></div>
      </div>

      {/* ─── 6. Additional Notes ─── */}
      <SectionHeader icon={StickyNote} label="Additional Notes" />
      <div><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes about this client..." className="min-h-[60px]" /></div>

      <Button className="w-full" disabled={!form.first_name || !form.last_name || isPending} onClick={handleSubmit}>
        {isPending ? 'Adding...' : 'Add Client'}
      </Button>
    </div>
  );
}
