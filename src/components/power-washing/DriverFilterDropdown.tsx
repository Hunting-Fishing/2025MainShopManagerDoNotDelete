import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users } from 'lucide-react';

interface TeamMember {
  id: string;
  profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface DriverFilterDropdownProps {
  selectedDriver: string;
  onDriverChange: (driverId: string) => void;
  teamMembers: TeamMember[];
  isLoading?: boolean;
}

export function DriverFilterDropdown({
  selectedDriver,
  onDriverChange,
  teamMembers,
  isLoading = false
}: DriverFilterDropdownProps) {
  const getDriverName = (member: TeamMember) => {
    if (!member.profile) return 'Unknown';
    const { first_name, last_name } = member.profile;
    return `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown';
  };

  return (
    <Select value={selectedDriver} onValueChange={onDriverChange}>
      <SelectTrigger className="w-[200px] bg-background">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Filter by driver" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border z-50">
        <SelectItem value="all">All Employees</SelectItem>
        {isLoading ? (
          <SelectItem value="loading" disabled>Loading...</SelectItem>
        ) : (
          teamMembers.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {getDriverName(member)}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
