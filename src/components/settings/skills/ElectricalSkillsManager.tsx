
import { BaseSkillManager } from './BaseSkillManager';
import { electricalSkills } from "@/components/team/form/skills/categories/electricalSkills";

export function ElectricalSkillsManager() {
  const initialCategories = [
    {
      name: 'Diagnostic Systems',
      skills: [
        'Computer Diagnostics',
        'Sensor Testing',
        'Circuit Testing',
        'Wiring Repairs'
      ]
    },
    {
      name: 'Electrical Components',
      skills: [
        'Battery Systems',
        'Starter Systems',
        'Alternator Repair',
        'Lighting Systems'
      ]
    }
  ];

  return <BaseSkillManager initialCategories={initialCategories} title="Electrical Skills" />;
}
