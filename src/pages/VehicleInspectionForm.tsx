
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Camera, Save, FileText, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VehicleInfoTab from "@/components/inspection-form/VehicleInfoTab";
import ExteriorCheckTab from "@/components/inspection-form/ExteriorCheckTab";
import InteriorCheckTab from "@/components/inspection-form/InteriorCheckTab";
import EngineBayTab from "@/components/inspection-form/EngineBayTab";
import TiresTab from "@/components/inspection-form/TiresTab";
import { toast } from "sonner";

export default function VehicleInspectionForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("vehicle");
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update progress based on tab
    const progressMap: Record<string, number> = {
      "vehicle": 0,
      "exterior": 25,
      "interior": 50,
      "engine": 75,
      "tires": 100
    };
    
    setProgress(progressMap[value] || 0);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success("Inspection form submitted successfully");
      setIsSubmitting(false);
      navigate("/forms");
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/forms')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vehicle Inspection</h1>
            <p className="text-muted-foreground mt-1">
              Complete all sections to submit the inspection form
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Form saved as draft")}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || progress < 100}
          >
            {isSubmitting ? "Submitting..." : "Submit Inspection"}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 overflow-hidden">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="overflow-auto mb-6">
          <TabsList className="inline-flex w-full md:w-auto">
            <TabsTrigger value="vehicle" className="px-4 py-2">Vehicle Info</TabsTrigger>
            <TabsTrigger value="exterior" className="px-4 py-2">Exterior</TabsTrigger>
            <TabsTrigger value="interior" className="px-4 py-2">Interior</TabsTrigger>
            <TabsTrigger value="engine" className="px-4 py-2">Engine Bay</TabsTrigger>
            <TabsTrigger value="tires" className="px-4 py-2">Tires & Suspension</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="space-y-6">
          <TabsContent value="vehicle" className="space-y-4 mt-0">
            <VehicleInfoTab />
          </TabsContent>
          
          <TabsContent value="exterior" className="space-y-4 mt-0">
            <ExteriorCheckTab />
          </TabsContent>
          
          <TabsContent value="interior" className="space-y-4 mt-0">
            <InteriorCheckTab />
          </TabsContent>
          
          <TabsContent value="engine" className="space-y-4 mt-0">
            <EngineBayTab />
          </TabsContent>
          
          <TabsContent value="tires" className="space-y-4 mt-0">
            <TiresTab />
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={() => {
            // Navigate to previous tab
            const tabs = ["vehicle", "exterior", "interior", "engine", "tires"];
            const currentIndex = tabs.indexOf(activeTab);
            if (currentIndex > 0) {
              handleTabChange(tabs[currentIndex - 1]);
            }
          }}
          disabled={activeTab === "vehicle"}
        >
          Previous
        </Button>
        
        {activeTab !== "tires" ? (
          <Button
            onClick={() => {
              // Navigate to next tab
              const tabs = ["vehicle", "exterior", "interior", "engine", "tires"];
              const currentIndex = tabs.indexOf(activeTab);
              if (currentIndex < tabs.length - 1) {
                handleTabChange(tabs[currentIndex + 1]);
              }
            }}
          >
            Next
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Form saved as PDF")}>
              <FileText className="h-4 w-4 mr-2" /> Export PDF
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="md:hidden"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
