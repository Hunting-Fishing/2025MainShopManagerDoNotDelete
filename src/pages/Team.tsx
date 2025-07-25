
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TeamContent } from '@/components/team/TeamContent';
import { TeamHeader } from '@/components/team/TeamHeader';
import { useTeamMembers } from '@/hooks/useTeamMembers';

/**
 * IMPORTANT: This page uses full team management functionality
 * DO NOT replace with placeholder text - full functionality exists
 * Includes: team member list, creation, roles, permissions, etc.
 */
export default function Team() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  // Use real team data from the database
  const { teamMembers, isLoading, error } = useTeamMembers();
  
  if (error) {
    console.error('Error loading team members:', error);
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="p-6 space-y-6">
          <TeamHeader />
          <TeamContent 
            members={teamMembers}
            isLoading={isLoading}
            view={view}
            getInitials={getInitials}
          />
        </div>
      } />
      <Route path="/*" element={
        <TeamContent 
          members={teamMembers}
          isLoading={isLoading}
          view={view}
          getInitials={getInitials}
        />
      } />
    </Routes>
  );
}
