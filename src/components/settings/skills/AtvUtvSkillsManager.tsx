
import { BaseSkillManager } from './BaseSkillManager';
import { groupedAtvUtvBrands } from "@/components/team/form/skills/categories/atvUtvBrands";

export function AtvUtvSkillsManager() {
  const initialCategories = [
    {
      name: 'Mainstream Recreational',
      skills: groupedAtvUtvBrands.recreational.map(brand => `${brand.flag} ${brand.name}`)
    },
    {
      name: 'Work Utility & Agricultural',
      skills: groupedAtvUtvBrands.workUtility.map(brand => `${brand.flag} ${brand.name}`)
    },
    {
      name: 'Electric & New Tech',
      skills: groupedAtvUtvBrands.electric.map(brand => `${brand.flag} ${brand.name}`)
    },
    {
      name: 'Global & Niche Brands',
      skills: groupedAtvUtvBrands.european.map(brand => `${brand.flag} ${brand.name}`)
    }
  ];

  return <BaseSkillManager initialCategories={initialCategories} title="ATV/UTV Manufacturers" />;
}
