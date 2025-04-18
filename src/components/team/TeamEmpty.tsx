
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface TeamEmptyProps {
  hasMembers: boolean;
}

export function TeamEmpty({ hasMembers }: TeamEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Users className="h-6 w-6 text-slate-500" />
      </div>
      
      {hasMembers ? (
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No matching team members</h3>
          <p className="text-slate-500 mb-4">
            No team members were found with the current filters.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No team members yet</h3>
          <p className="text-slate-500 mb-4">
            Get started by adding your first team member.
          </p>
          <Link to="/team/create">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
