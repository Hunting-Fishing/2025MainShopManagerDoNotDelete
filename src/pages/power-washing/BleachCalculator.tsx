import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Beaker, 
  Droplets, 
  AlertTriangle,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Common sodium hypochlorite concentrations
const COMMON_SOURCES = [
  { label: 'Pool Chlorine (12.5%)', value: 12.5 },
  { label: 'Industrial (10%)', value: 10 },
  { label: 'Commercial (8.25%)', value: 8.25 },
  { label: 'Household Bleach (6%)', value: 6 },
  { label: 'Economy Bleach (3%)', value: 3 },
];

// Common target concentrations for power washing
const COMMON_TARGETS = [
  { label: 'House Wash (0.5-1%)', min: 0.5, max: 1, color: 'bg-green-500' },
  { label: 'Roof Wash (2-3%)', min: 2, max: 3, color: 'bg-yellow-500' },
  { label: 'Concrete (1-2%)', min: 1, max: 2, color: 'bg-blue-500' },
  { label: 'Heavy Mold (3-4%)', min: 3, max: 4, color: 'bg-orange-500' },
  { label: 'Tough Stains (5%+)', min: 5, max: 6, color: 'bg-red-500' },
];

export default function BleachCalculator() {
  const navigate = useNavigate();
  
  // Calculator state
  const [sourceConcentration, setSourceConcentration] = useState(12.5);
  const [targetConcentration, setTargetConcentration] = useState(1);
  const [totalMixture, setTotalMixture] = useState(5); // gallons
  
  // Calculate required amounts
  const calculations = useMemo(() => {
    if (targetConcentration > sourceConcentration) {
      return { error: 'Target cannot exceed source concentration' };
    }
    if (targetConcentration <= 0 || sourceConcentration <= 0) {
      return { error: 'Concentrations must be greater than 0' };
    }
    
    // C1V1 = C2V2 → V1 = (C2 * V2) / C1
    const bleachNeeded = (targetConcentration * totalMixture) / sourceConcentration;
    const waterNeeded = totalMixture - bleachNeeded;
    const dilutionRatio = sourceConcentration / targetConcentration;
    const partsWater = dilutionRatio - 1;
    
    return {
      bleachGallons: bleachNeeded,
      waterGallons: waterNeeded,
      dilutionRatio,
      partsWater,
      bleachOunces: bleachNeeded * 128,
      waterOunces: waterNeeded * 128,
    };
  }, [sourceConcentration, targetConcentration, totalMixture]);

  const handleQuickSource = (value: number) => {
    setSourceConcentration(value);
  };

  const handleQuickTarget = (min: number) => {
    setTargetConcentration(min);
  };

  const copyFormula = () => {
    if ('error' in calculations) return;
    
    const text = `Sodium Hypochlorite Dilution
Source: ${sourceConcentration}% SH
Target: ${targetConcentration}% mixture
Total: ${totalMixture} gallons

Recipe:
• Bleach: ${calculations.bleachGallons.toFixed(2)} gal (${calculations.bleachOunces.toFixed(0)} oz)
• Water: ${calculations.waterGallons.toFixed(2)} gal (${calculations.waterOunces.toFixed(0)} oz)
• Ratio: 1:${calculations.partsWater.toFixed(1)} (bleach:water)`;
    
    navigator.clipboard.writeText(text);
    toast.success('Formula copied to clipboard');
  };

  const resetCalculator = () => {
    setSourceConcentration(12.5);
    setTargetConcentration(1);
    setTotalMixture(5);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/power-washing/formulas')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Formulas
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Beaker className="h-6 w-6 text-primary" />
              SH / Bleach Calculator
            </h1>
            <p className="text-muted-foreground">Sodium Hypochlorite dilution calculator for power washing</p>
          </div>
          <Button variant="outline" onClick={resetCalculator}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Source Concentration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Source Bleach Concentration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_SOURCES.map((src) => (
                  <Button
                    key={src.value}
                    variant={sourceConcentration === src.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickSource(src.value)}
                  >
                    {src.label}
                  </Button>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Concentration (%)</Label>
                  <span className="text-2xl font-bold text-primary">{sourceConcentration}%</span>
                </div>
                <Slider
                  value={[sourceConcentration]}
                  onValueChange={([v]) => setSourceConcentration(v)}
                  min={0.5}
                  max={12.5}
                  step={0.25}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5%</span>
                  <span>12.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Concentration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Target Mixture Concentration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_TARGETS.map((target) => (
                  <Button
                    key={target.label}
                    variant={targetConcentration >= target.min && targetConcentration <= target.max ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickTarget(target.min)}
                    className="relative"
                  >
                    <span className={`w-2 h-2 rounded-full ${target.color} mr-2`} />
                    {target.label}
                  </Button>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Target (%)</Label>
                  <span className="text-2xl font-bold text-primary">{targetConcentration}%</span>
                </div>
                <Slider
                  value={[targetConcentration]}
                  onValueChange={([v]) => setTargetConcentration(v)}
                  min={0.1}
                  max={Math.min(12.5, sourceConcentration)}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.1%</span>
                  <span>{Math.min(12.5, sourceConcentration)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Volume */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Mixture Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={0.5}
                  max={100}
                  step={0.5}
                  value={totalMixture}
                  onChange={(e) => setTotalMixture(parseFloat(e.target.value) || 1)}
                  className="text-xl font-bold text-center"
                />
                <span className="text-muted-foreground">gallons</span>
              </div>
              <div className="flex gap-2 mt-3">
                {[1, 5, 10, 15, 20].map((v) => (
                  <Button
                    key={v}
                    variant={totalMixture === v ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTotalMixture(v)}
                  >
                    {v}g
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {'error' in calculations ? (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                  <span className="font-medium">{calculations.error}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Main Recipe */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Your Recipe</CardTitle>
                    <Button variant="outline" size="sm" onClick={copyFormula}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bleach Amount */}
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Beaker className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Sodium Hypochlorite</p>
                        <p className="text-sm text-muted-foreground">{sourceConcentration}% concentration</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{calculations.bleachGallons.toFixed(2)} gal</p>
                      <p className="text-sm text-muted-foreground">{calculations.bleachOunces.toFixed(0)} oz</p>
                    </div>
                  </div>

                  {/* Water Amount */}
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Droplets className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Water</p>
                        <p className="text-sm text-muted-foreground">Fresh water</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{calculations.waterGallons.toFixed(2)} gal</p>
                      <p className="text-sm text-muted-foreground">{calculations.waterOunces.toFixed(0)} oz</p>
                    </div>
                  </div>

                  {/* Ratio */}
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Dilution Ratio (Bleach : Water)</p>
                    <p className="text-3xl font-bold text-foreground">
                      1 : {calculations.partsWater.toFixed(1)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Reference */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">Source SH</p>
                      <p className="font-semibold text-foreground">{sourceConcentration}%</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">Final Mix</p>
                      <p className="font-semibold text-foreground">{targetConcentration}%</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">Total Volume</p>
                      <p className="font-semibold text-foreground">{totalMixture} gal</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">Dilution Factor</p>
                      <p className="font-semibold text-foreground">{calculations.dilutionRatio.toFixed(1)}x</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Warning */}
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">Safety Reminder</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Always add bleach to water, never water to bleach</li>
                        <li>• Wear proper PPE (gloves, eye protection)</li>
                        <li>• Never mix with acids or other chemicals</li>
                        <li>• Work in well-ventilated areas</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
