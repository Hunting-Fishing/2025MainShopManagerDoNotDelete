
import { useState } from 'react';
import { getCountryCode } from '@/utils/countryCodeMapper';
import * as flags from 'country-flag-icons/react/3x2';

export const useSkillManagement = (
  isSkillSelected: (skill: string) => boolean,
  getProficiencyForSkill: (skill: string) => string,
  addSkill: (skill: string, proficiency: string) => void,
  removeSkill: (skill: string) => void
) => {
  const [selectedProficiency, setSelectedProficiency] = useState('intermediate');

  const handleSkillAdd = (skill: string) => {
    addSkill(skill, selectedProficiency);
  };

  const handleSkillRemove = (skill: string) => {
    removeSkill(skill);
  };

  const getSkillContent = (skill: string) => {
    const hasFlag = skill.match(/^\S+\s/) && /\p{Emoji}/u.test(skill.split(' ')[0]);
    
    if (!hasFlag) return { name: skill, FlagComponent: null };

    const parts = skill.split(' ');
    const flag = parts[0];
    const name = parts.slice(1).join(' ');
    const countryCode = getCountryCode(flag);
    const FlagComponent = countryCode ? (flags as any)[countryCode] : null;

    return { name, FlagComponent };
  };

  return {
    selectedProficiency,
    setSelectedProficiency,
    handleSkillAdd,
    handleSkillRemove,
    getSkillContent,
    isSkillSelected,
    getProficiencyForSkill
  };
};
