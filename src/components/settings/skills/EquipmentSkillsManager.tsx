
import { BaseSkillManager } from './BaseSkillManager';
import { equipmentSkills } from "@/components/team/form/skills/categories/equipmentSkills";

export function EquipmentSkillsManager() {
  const initialCategories = [
    {
      name: 'Heavy Equipment',
      skills: [
        'Excavators',
        'Bulldozers',
        'Cranes',
        'Forklifts'
      ]
    },
    {
      name: 'Power Tools',
      skills: [
        'Diagnostic Equipment',
        'Welding Equipment',
        'Pneumatic Tools',
        'Hydraulic Tools'
      ]
    }
  ];

  return <BaseSkillManager initialCategories={initialCategories} title="Equipment Skills" />;
}
