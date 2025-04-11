
import React from "react";
import { TeamMemberHistoryRecord } from "@/utils/team/history";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActionBadge } from "./ActionBadge";
import { HistoryDetails } from "./HistoryDetails";
import { DateDisplay } from "./DateDisplay";

interface HistoryTableProps {
  records: TeamMemberHistoryRecord[];
}

export const HistoryTable = ({ records }: HistoryTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium whitespace-nowrap">
                <DateDisplay timestamp={record.timestamp} />
              </TableCell>
              <TableCell>
                <ActionBadge actionType={record.action_type} />
              </TableCell>
              <TableCell className="max-w-xs truncate">
                <HistoryDetails record={record} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span className="text-sm">{record.action_by_name || 'System'}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
