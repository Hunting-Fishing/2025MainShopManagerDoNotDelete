
import React from 'react';
import { RepairPlanForm } from '@/components/repair-plan/RepairPlanForm';
import { RepairPlanHeader } from '@/components/repair-plan/RepairPlanHeader';

export default function CreateRepairPlan() {
  return (
    <div className="container mx-auto py-8">
      <RepairPlanHeader />
      <div className="mt-8">
        <RepairPlanForm />
      </div>
    </div>
  );
}
