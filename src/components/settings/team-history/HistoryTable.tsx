
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Flag, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { TeamMemberHistoryRecord } from "@/utils/team/history";
import { ActionBadge } from "./ActionBadge";
import { DateDisplay } from "./DateDisplay";
import { HistoryDetails } from "./HistoryDetails";

interface HistoryTableProps {
  records: TeamMemberHistoryRecord[];
  onViewDetails?: (record: TeamMemberHistoryRecord) => void;
  onFlag?: (record: TeamMemberHistoryRecord) => void;
  onResolve?: (record: TeamMemberHistoryRecord) => void;
}

export function HistoryTable({ 
  records, 
  onViewDetails = () => {}, 
  onFlag = () => {},
  onResolve = () => {}
}: HistoryTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <div className="font-medium">{record.action_by_name || "System"}</div>
                <div className="text-xs text-muted-foreground">{record.action_by}</div>
              </TableCell>
              <TableCell>
                <ActionBadge actionType={record.action_type} />
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                <HistoryDetails record={record} />
              </TableCell>
              <TableCell>
                <DateDisplay timestamp={record.timestamp} />
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(record)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {record.details && record.details.flagged && !record.details.resolved ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onResolve(record)}
                    className="h-8 w-8 p-0 text-green-500 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                ) : record.details && !record.details.flagged ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFlag(record)}
                    className="h-8 w-8 p-0 text-amber-500 hover:text-amber-700"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
