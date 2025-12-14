import { ProjectBudgetDashboard } from '@/components/projects/ProjectBudgetDashboard';
import { ResourceConflictAlert } from '@/components/projects/ResourceConflictAlert';

export default function Projects() {
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ResourceConflictAlert />
      <ProjectBudgetDashboard />
    </div>
  );
}
