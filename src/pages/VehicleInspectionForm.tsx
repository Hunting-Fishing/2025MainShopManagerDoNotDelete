
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Camera, Save, FileText, Send, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VehicleInfoTab from "@/components/inspection-form/VehicleInfoTab";
import ExteriorCheckTab from "@/components/inspection-form/ExteriorCheckTab";
import InteriorCheckTab from "@/components/inspection-form/InteriorCheckTab";
import EngineBayTab from "@/components/inspection-form/EngineBayTab";
import TiresTab from "@/components/inspection-form/TiresTab";
import BrakesTab from "@/components/inspection-form/BrakesTab";
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
      "exterior": 17,
      "interior": 34,
      "engine": 51,
      "brakes": 68,
      "tires": 85
    };
    
    setProgress(progressMap[value] || 0);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success("Inspection form submitted successfully", {
        description: "The vehicle inspection has been recorded",
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
      setIsSubmitting(false);
      navigate("/forms");
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/forms')}
            className="mr-4 rounded-full h-10 w-10 p-0 sm:h-auto sm:w-auto sm:p-3 sm:rounded-md"
          >
            <ArrowLeft className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Vehicle Inspection
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete all sections to submit the inspection form
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => toast.info("Form saved as draft", {
              description: "You can continue editing later"
            })}
            className="transition-all duration-200 hover:bg-blue-50"
          >
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || progress < 85}
            className={`${progress >= 85 ? 'animate-pulse' : ''} transition-all duration-300`}
          >
            {isSubmitting ? "Submitting..." : "Submit Inspection"}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-3 bg-gray-100 rounded-full mb-6 overflow-hidden shadow-inner">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1">
          <div className={`h-3 w-1 bg-white rounded-full ${progress >= 0 ? 'opacity-100' : 'opacity-30'}`}></div>
          <div className={`h-3 w-1 bg-white rounded-full ${progress >= 17 ? 'opacity-100' : 'opacity-30'}`}></div>
          <div className={`h-3 w-1 bg-white rounded-full ${progress >= 34 ? 'opacity-100' : 'opacity-30'}`}></div>
          <div className={`h-3 w-1 bg-white rounded-full ${progress >= 51 ? 'opacity-100' : 'opacity-30'}`}></div>
          <div className={`h-3 w-1 bg-white rounded-full ${progress >= 68 ? 'opacity-100' : 'opacity-30'}`}></div>
          <div className={`h-3 w-1 bg-white rounded-full ${progress >= 85 ? 'opacity-100' : 'opacity-30'}`}></div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="overflow-auto mb-6">
          <TabsList className="inline-flex w-full md:w-auto">
            <TabsTrigger 
              value="vehicle" 
              className="px-4 py-3 flex-1 md:flex-initial min-w-[120px]"
              data-state={activeTab === "vehicle" ? "active" : ""}
            >
              Vehicle Info
            </TabsTrigger>
            <TabsTrigger 
              value="exterior" 
              className="px-4 py-3 flex-1 md:flex-initial min-w-[120px]"
              data-state={activeTab === "exterior" ? "active" : ""}
            >
              Exterior
            </TabsTrigger>
            <TabsTrigger 
              value="interior" 
              className="px-4 py-3 flex-1 md:flex-initial min-w-[120px]"
              data-state={activeTab === "interior" ? "active" : ""}
            >
              Interior
            </TabsTrigger>
            <TabsTrigger 
              value="engine" 
              className="px-4 py-3 flex-1 md:flex-initial min-w-[120px]"
              data-state={activeTab === "engine" ? "active" : ""}
            >
              Engine Bay
            </TabsTrigger>
            <TabsTrigger 
              value="brakes" 
              className="px-4 py-3 flex-1 md:flex-initial min-w-[120px]"
              data-state={activeTab === "brakes" ? "active" : ""}
            >
              Brakes
            </TabsTrigger>
            <TabsTrigger 
              value="tires" 
              className="px-4 py-3 flex-1 md:flex-initial min-w-[120px]"
              data-state={activeTab === "tires" ? "active" : ""}
            >
              Tires & Suspension
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="space-y-6">
          <TabsContent value="vehicle" className="space-y-4 mt-0 animate-fade-in">
            <VehicleInfoTab />
          </TabsContent>
          
          <TabsContent value="exterior" className="space-y-4 mt-0 animate-fade-in">
            <ExteriorCheckTab />
          </TabsContent>
          
          <TabsContent value="interior" className="space-y-4 mt-0 animate-fade-in">
            <InteriorCheckTab />
          </TabsContent>
          
          <TabsContent value="engine" className="space-y-4 mt-0 animate-fade-in">
            <EngineBayTab />
          </TabsContent>
          
          <TabsContent value="brakes" className="space-y-4 mt-0 animate-fade-in">
            <BrakesTab />
          </TabsContent>
          
          <TabsContent value="tires" className="space-y-4 mt-0 animate-fade-in">
            <TiresTab />
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={() => {
            // Navigate to previous tab
            const tabs = ["vehicle", "exterior", "interior", "engine", "brakes", "tires"];
            const currentIndex = tabs.indexOf(activeTab);
            if (currentIndex > 0) {
              handleTabChange(tabs[currentIndex - 1]);
            }
          }}
          disabled={activeTab === "vehicle"}
          className="shadow-sm hover:shadow transition-all duration-200"
        >
          Previous
        </Button>
        
        {activeTab !== "tires" ? (
          <Button
            onClick={() => {
              // Navigate to next tab
              const tabs = ["vehicle", "exterior", "interior", "engine", "brakes", "tires"];
              const currentIndex = tabs.indexOf(activeTab);
              if (currentIndex < tabs.length - 1) {
                handleTabChange(tabs[currentIndex + 1]);
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Next
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => toast.info("Form saved as PDF", {
                description: "Download started"
              })}
              className="shadow-sm hover:shadow transition-all duration-200"
            >
              <FileText className="h-4 w-4 mr-2" /> Export PDF
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
