
import React from "react";
import { Customer, CustomerCommunication } from "@/types/customer";
import { Calendar, MessageSquare, User } from "lucide-react";

interface CommunicationHistoryProps {
  customer: Customer;
  communications: CustomerCommunication[];
  onCommunicationAdded?: (communication: CustomerCommunication) => void;
}

const typeColors: Record<string, string> = {
  email: "bg-blue-100 text-blue-800 border border-blue-300",
  phone: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  text: "bg-green-100 text-green-800 border border-green-300",
  "in-person": "bg-purple-100 text-purple-800 border border-purple-300"
};

const directionColors: Record<string, string> = {
  incoming: "bg-green-50 text-green-800 border border-green-200",
  outgoing: "bg-gray-50 text-gray-800 border border-gray-200"
};

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800 border border-green-300",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  failed: "bg-red-100 text-red-800 border border-red-300"
};

export function CommunicationHistory({
  customer,
  communications,
  onCommunicationAdded,
}: CommunicationHistoryProps) {
  if (!communications || communications.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-muted-foreground">
        <MessageSquare className="w-8 h-8 mb-2" />
        <div>No communications found for this customer.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {communications.map((comm) => (
        <div
          key={comm.id}
          className="bg-white shadow-md rounded-xl border border-gray-100 p-4 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {comm.type === "email" && (
                <MessageSquare className="w-5 h-5 text-blue-400" />
              )}
              {comm.type === "phone" && (
                <PhoneIcon className="w-5 h-5 text-yellow-500" />
              )}
              {comm.type === "text" && (
                <MessageSquare className="w-5 h-5 text-green-500" />
              )}
              {comm.type === "in-person" && (
                <User className="w-5 h-5 text-purple-500" />
              )}

              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[comm.type]}`}>
                {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${directionColors[comm.direction]}`}>
                {comm.direction === "incoming" ? "Incoming" : "Outgoing"}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${statusColors[comm.status]}`}>
                {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-400 gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(comm.date).toLocaleString()}
            </div>
          </div>

          <div className="text-sm whitespace-pre-line text-gray-700 mt-1">
            {comm.subject && (
              <div>
                <span className="font-semibold">{comm.subject}</span>
              </div>
            )}
            {comm.content}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <User className="w-4 h-4" />
            {comm.staff_member_name}
            {comm.template_name && (
              <span className="ml-2 px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                Template: {comm.template_name}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple Phone icon (since lucide-react only allows a set)
function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M22 16.92V21a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07A19.5 19.5 0 013 5.18 2 2 0 015 3h4.09a2 2 0 012 1.72c.13 1 .37 2.09.72 3.24a2 2 0 01-.45 2L9.91 12.09a16 16 0 007 7l2.09-2.09a2 2 0 012-.45c1.15.35 2.24.59 3.25.72A2 2 0 0122 16.92z"></path>
    </svg>
  );
}
