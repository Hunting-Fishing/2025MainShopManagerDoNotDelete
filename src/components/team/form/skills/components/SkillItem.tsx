
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { proficiencyLevels } from '../SkillCategories';
import { ManufacturerLogo } from './ManufacturerLogo';
import * as flags from 'country-flag-icons/react/3x2';
import { cn } from "@/lib/utils";

interface SkillItemProps {
  skill: string;
  isSelected: boolean;
  currentProficiency: string;
  onAdd: (skill: string, proficiency: string) => void;
  onRemove: (skill: string) => void;
  selectedProficiency: string;
}

export const SkillItem = ({
  skill,
  isSelected,
  currentProficiency,
  onAdd,
  onRemove,
  selectedProficiency
}: SkillItemProps) => {
  const hasFlag = skill.match(/^\S+\s/) && /\p{Emoji}/u.test(skill.split(' ')[0]);
  
  const getCountryCode = (flag: string): string => {
    const emojiToCode: { [key: string]: string } = {
      '🇯🇵': 'JP', '🇰🇷': 'KR', '🇨🇳': 'CN', '🇺🇸': 'US',
      '🇩🇪': 'DE', '🇮🇹': 'IT', '🇫🇷': 'FR', '🇬🇧': 'GB',
      '🇸🇪': 'SE', '🇨🇦': 'CA', '🇹🇼': 'TW', '🇮🇳': 'IN',
      '🇻🇳': 'VN'
    };
    return emojiToCode[flag] || '';
  };

  const renderSkillContent = () => {
    if (!hasFlag) return skill;

    const parts = skill.split(' ');
    const flag = parts[0];
    const name = parts.slice(1).join(' ');
    const countryCode = getCountryCode(flag);
    const FlagComponent = countryCode ? (flags as any)[countryCode] : null;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {FlagComponent && <FlagComponent className="h-4 w-6" />}
          <ManufacturerLogo manufacturer={name} />
        </div>
        <span>{name}</span>
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-2 border rounded",
        "hover:bg-gray-50 transition-colors duration-200",
        hasFlag && "bg-slate-50"
      )}
    >
      <div className="flex-1">
        {renderSkillContent()}
      </div>
      
      {isSelected ? (
        <div className="flex items-center gap-2">
          <select 
            className="border rounded p-1 text-xs"
            value={currentProficiency}
            onChange={(e) => {
              onRemove(skill);
              onAdd(skill, e.target.value);
            }}
          >
            {proficiencyLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRemove(skill)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          className="h-7"
          onClick={() => onAdd(skill, selectedProficiency)}
        >
          Add
        </Button>
      )}
    </div>
  );
};
