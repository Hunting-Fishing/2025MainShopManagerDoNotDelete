
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { TeamContent } from '@/components/team/TeamContent';
import { TeamHeader } from '@/components/team/TeamHeader';

/**
 * IMPORTANT: This page uses full team management functionality
 * DO NOT replace with placeholder text - full functionality exists
 * Includes: team member list, creation, roles, permissions, etc.
 */
export default function Team() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="p-6 space-y-6">
          <TeamHeader />
          <TeamContent />
        </div>
      } />
      <Route path="/*" element={<TeamContent />} />
    </Routes>
  );
}
