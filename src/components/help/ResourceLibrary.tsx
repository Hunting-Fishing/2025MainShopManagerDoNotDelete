import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Video, Calculator } from "lucide-react";

export const ResourceLibrary: React.FC = () => {
  const mockResources = [
    {
      id: '1',
      title: 'Work Order Template',
      description: 'Professional work order template',
      resource_type: 'template',
      tags: ['template', 'work-order']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resource Library</h2>
        <p className="text-muted-foreground">Download templates and tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockResources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <CardTitle className="text-lg">{resource.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
              <div className="flex justify-between items-center">
                <Badge variant="outline">{resource.resource_type}</Badge>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};