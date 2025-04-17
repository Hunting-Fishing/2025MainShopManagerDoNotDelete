
import { useState, useEffect } from 'react';
import { skillCategories } from '../SkillCategories';

export function useSkillSearch() {
  const [skillSearch, setSkillSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (skillSearch) {
      const searchLower = skillSearch.toLowerCase();
      const matchingCategories = skillCategories
        .filter(category => {
          const categoryMatches = category.skills.some(skill => 
            skill.toLowerCase().includes(searchLower)
          );
          
          const subCategoryMatches = category.subCategories ? 
            Object.values(category.subCategories).some(subCategory => {
              if (Array.isArray(subCategory)) {
                return subCategory.some(skill => 
                  skill.toLowerCase().includes(searchLower)
                );
              } else if (typeof subCategory === 'object' && subCategory !== null && 'skills' in subCategory) {
                return subCategory.skills.some(skill => 
                  skill.toLowerCase().includes(searchLower)
                );
              }
              return false;
            }) : false;
            
          return categoryMatches || subCategoryMatches;
        })
        .map(category => category.id);
      
      setExpandedCategories(prev => {
        const newExpanded = [...prev];
        matchingCategories.forEach(id => {
          if (!newExpanded.includes(id)) {
            newExpanded.push(id);
          }
        });
        return newExpanded;
      });
    }
  }, [skillSearch]);

  return {
    skillSearch,
    setSkillSearch,
    expandedCategories,
    setExpandedCategories
  };
}
