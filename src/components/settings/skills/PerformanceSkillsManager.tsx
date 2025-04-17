
import { BaseSkillManager } from './BaseSkillManager';
import { performanceSkills } from "@/components/team/form/skills/categories/performanceSkills";

export function PerformanceSkillsManager() {
  const initialCategories = [
    {
      name: 'Engine Performance',
      skills: [
        'Engine Tuning',
        'Turbocharger Installation',
        'Supercharger Systems',
        'Performance Chips'
      ]
    },
    {
      name: 'Suspension & Handling',
      skills: [
        'Custom Suspension',
        'Lowering Springs',
        'Performance Shocks',
        'Chassis Tuning'
      ]
    }
  ];

  return <BaseSkillManager initialCategories={initialCategories} title="Performance Skills" />;
}
