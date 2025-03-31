
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Mail, 
  Clock, 
  Check, 
  AlertTriangle,
  Calendar,
  User,
  CalendarClock
} from "lucide-react";
import { EmailSequence, EmailSequenceStep } from "@/types/email";

interface EmailSequenceFlowProps {
  sequence: EmailSequence;
  className?: string;
}

export function EmailSequenceFlow({ sequence, className = "" }: EmailSequenceFlowProps) {
  // Sort steps by position
  const sortedSteps = [...sequence.steps].sort((a, b) => a.position - b.position);
  
  if (sortedSteps.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 border border-dashed rounded-lg ${className}`}>
        <div className="text-center">
          <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No steps defined for this sequence</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center mb-3">
          {sequence.triggerType === 'manual' && (
            <User className="h-5 w-5 mr-2 text-primary" />
          )}
          {sequence.triggerType === 'event' && (
            <Calendar className="h-5 w-5 mr-2 text-primary" />
          )}
          {sequence.triggerType === 'schedule' && (
            <CalendarClock className="h-5 w-5 mr-2 text-primary" />
          )}
          <div>
            <p className="font-medium">Sequence Trigger</p>
            <p className="text-sm text-muted-foreground">
              {sequence.triggerType === 'manual' && 'Manual Enrollment'}
              {sequence.triggerType === 'event' && sequence.triggerEvent ? `Event: ${sequence.triggerEvent}` : 'Event Based'}
              {sequence.triggerType === 'schedule' && 'Scheduled'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-8 py-4">
        {sortedSteps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connecting line */}
            {index < sortedSteps.length - 1 && (
              <div className="absolute top-full h-8 border-l border-dashed border-gray-300 left-6 z-0" />
            )}
            
            <div className="flex items-start relative z-10">
              <div className="flex-shrink-0">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${step.isActive ? 'bg-primary/10' : 'bg-gray-100'} mb-2`}>
                  <Mail className={`h-6 w-6 ${step.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center text-xs text-muted-foreground">Step {index + 1}</div>
              </div>
              
              <div className="ml-4 flex-grow">
                <Card className="p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{step.name}</h4>
                    <Badge variant={step.isActive ? "default" : "secondary"}>
                      {step.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {step.delayHours > 0 ? (
                        <>Wait {step.delayHours} hours ({step.delayType === 'business_days' ? 'business hours' : 'fixed'})</>
                      ) : (
                        <>Send immediately</>
                      )}
                    </span>
                  </div>
                  
                  {step.condition && (
                    <div className="bg-amber-50 p-2 rounded-md border border-amber-200 text-sm mb-3">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-1 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-700">Conditional Step</p>
                          <p className="text-amber-600">
                            {step.condition.type === 'event' ? (
                              <>Only if event <span className="font-medium">{step.condition.value}</span> has occurred</>
                            ) : (
                              <>Only if <span className="font-medium">{step.condition.value}</span> {step.condition.operator} value</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm">
                    Template: <span className="font-medium">{step.templateId}</span>
                  </div>
                </Card>
                
                {index < sortedSteps.length - 1 && (
                  <div className="flex justify-center my-4">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
