import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  ClipboardCheck, 
  Truck, 
  FileText, 
  Award,
  Wrench,
  Plus,
  Ship,
  Forklift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SafetyQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Report Incident',
      icon: AlertTriangle,
      href: '/safety/incidents/new',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10 hover:bg-destructive/20'
    },
    {
      label: 'Vessel Inspection',
      icon: Ship,
      href: '/safety/vessels',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20'
    },
    {
      label: 'Forklift Inspection',
      icon: Forklift,
      href: '/safety/equipment/forklift',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20'
    },
    {
      label: 'Daily Inspection',
      icon: ClipboardCheck,
      href: '/safety/inspections/new',
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20'
    },
    {
      label: 'DVIR Report',
      icon: Truck,
      href: '/safety/dvir/new',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
      label: 'Lift Inspection',
      icon: Wrench,
      href: '/safety/equipment/inspect',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 hover:bg-amber-500/20'
    },
    {
      label: 'Safety Documents',
      icon: FileText,
      href: '/safety/documents',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20'
    },
    {
      label: 'Certifications',
      icon: Award,
      href: '/safety/certifications',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className={`h-auto py-4 flex flex-col items-center gap-2 ${action.bgColor} transition-colors`}
              onClick={() => navigate(action.href)}
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
