
import { BaseSkillManager } from './BaseSkillManager';
import { mechanicalSkills } from "@/components/team/form/skills/categories/mechanicalSkills";

export function MechanicalSkillsManager() {
  const initialCategories = [
    {
      name: 'Engine Systems',
      skills: [
        'Engine Diagnostics',
        'Engine Repair',
        'Engine Rebuilding',
        'Fuel Systems',
        'Cooling Systems',
      ]
    },
    {
      name: 'Transmission Systems',
      skills: [
        'Automatic Transmission',
        'Manual Transmission',
        'Transmission Repair',
        'Clutch Systems',
        'Drive Train'
      ]
    }
  ];

  return <BaseSkillManager initialCategories={initialCategories} title="Mechanical Skills" />;
}
