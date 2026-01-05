import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ClipboardList,
  Plus,
  Search,
  ArrowLeft
} from 'lucide-react';
import { useGunsmithJobs, useUpdateGunsmithJob } from '@/hooks/useGunsmith';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const JOB_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'awaiting_parts', label: 'Awaiting Parts' },
  { value: 'completed', label: 'Completed' },
  { value: 'picked_up', label: 'Picked Up' }
];

export default function GunsmithJobs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [dueFilter, setDueFilter] = useState('all');

  const { data: jobs, isLoading } = useGunsmithJobs(statusFilter === 'all' ? undefined : statusFilter);
  const updateJob = useUpdateGunsmithJob();

  const assigneeOptions = useMemo(() => {
    const assignees = new Set<string>();
    (jobs || []).forEach((job) => {
      if (job.assigned_to) {
        assignees.add(job.assigned_to);
      }
    });
    return Array.from(assignees);
  }, [jobs]);

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch =
      job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.gunsmith_firearms?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.gunsmith_firearms?.model?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAssignee = assigneeFilter === 'all' || job.assigned_to === assigneeFilter;

    const today = new Date();
    const dueDate = job.estimated_completion ? new Date(job.estimated_completion) : null;
    const isOverdue = dueDate ? dueDate < today : false;
    const isDueSoon = dueDate
      ? dueDate >= today && dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      : false;

    const matchesDue =
      dueFilter === 'all' ||
      (dueFilter === 'overdue' && isOverdue) ||
      (dueFilter === 'due_soon' && isDueSoon);

    return matchesSearch && matchesAssignee && matchesDue;
  });

  const isOverdue = (job: any) => {
    if (!job.estimated_completion) return false;
    return new Date(job.estimated_completion) < new Date();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'awaiting_parts': return 'bg-yellow-500';
      case 'picked_up': return 'bg-gray-500';
      default: return 'bg-amber-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gunsmith')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-amber-600" />
              Jobs
            </h1>
            <p className="text-muted-foreground mt-1">Manage repair and service work orders</p>
          </div>
        </div>
        <Button onClick={() => navigate('/gunsmith/jobs/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {JOB_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Assigned to" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {assigneeOptions.map((assignee) => (
              <SelectItem key={assignee} value={assignee}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dueFilter} onValueChange={setDueFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Due date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="due_soon">Due in 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : filteredJobs?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No jobs found</p>
              <Button variant="link" onClick={() => navigate('/gunsmith/jobs/new')}>
                Create your first job
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs?.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => navigate(`/gunsmith/jobs/${job.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{job.job_number}</span>
                      <Badge className={`${getStatusColor(job.status)} text-white`}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{job.priority}</Badge>
                      {isOverdue(job) && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {job.customers?.first_name} {job.customers?.last_name} - {job.job_type}
                    </p>
                    {job.gunsmith_firearms && (
                      <p className="text-sm text-muted-foreground">
                        {job.gunsmith_firearms.make} {job.gunsmith_firearms.model}
                        {job.gunsmith_firearms.serial_number && ` - S/N: ${job.gunsmith_firearms.serial_number}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {job.total_cost && (
                      <p className="font-medium text-green-600">${job.total_cost.toFixed(2)}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {job.received_date && format(new Date(job.received_date), 'MMM d, yyyy')}
                    </p>
                    <Select
                      value={job.status}
                      onValueChange={(v) => {
                        updateJob.mutate({ id: job.id, status: v });
                      }}
                    >
                      <SelectTrigger className="w-36 mt-2" onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_STATUSES.filter(s => s.value !== 'all').map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
