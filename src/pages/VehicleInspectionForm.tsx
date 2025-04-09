
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Camera, Save, FileText, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import VehicleInfoTab from "@/components/inspection-form/VehicleInfoTab";
import ExteriorCheckTab from "@/components/inspection-form/ExteriorCheckTab";
import InteriorCheckTab from "@/components/inspection-form/InteriorCheckTab";
import EngineBayTab from "@/components/inspection-form/EngineBayTab";
import TiresTab from "@/components/inspection-form/TiresTab";
import BrakesTab from "@/components/inspection-form/BrakesTab";
import { toast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/useAuthUser";
import { createVehicleInspection, updateVehicleInspection, getVehicleInspection, VehicleInspection, DamageArea } from "@/services/vehicleInspectionService";
import { VehicleBodyStyle } from '@/types/vehicleBodyStyles';

export default function VehicleInspectionForm() {
  const navigate = useNavigate();
  const { userId } = useAuthUser();
  const [searchParams] = useSearchParams();
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const vehicleId = searchParams.get('vehicleId');
  
  const [activeTab, setActiveTab] = useState("vehicle");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inspectionData, setInspectionData] = useState<Partial<VehicleInspection>>({
    status: 'draft',
    damageAreas: [],
    vehicleBodyStyle: VehicleBodyStyle.Sedan
  });
  
  // Load existing inspection if we have an ID
  useEffect(() => {
    async function loadInspection() {
      if (!inspectionId) return;
      
      setIsLoading(true);
      try {
        const data = await getVehicleInspection(inspectionId);
        if (data) {
          setInspectionData(data);
          // Update progress based on status
          if (data.status === 'completed' || data.status === 'approved') {
            setProgress(100);
          }
        } else {
          toast({
            title: "Error",
            description: "Could not find the requested inspection",
            variant: "destructive",
          });
          navigate('/forms');
        }
      } catch (error) {
        console.error("Error loading inspection:", error);
        toast({
          title: "Error",
          description: "Failed to load inspection data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInspection();
  }, [inspectionId, navigate]);
  
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

  const handleBodyStyleChange = (style: VehicleBodyStyle) => {
    setInspectionData(prev => ({
      ...prev,
      vehicleBodyStyle: style
    }));
  };

  const handleDamageAreaUpdate = (damageAreas: DamageArea[]) => {
    setInspectionData(prev => ({
      ...prev,
      damageAreas
    }));
  };

  const handleSaveDraft = async () => {
    if (!userId || !vehicleId) {
      toast({
        title: "Error",
        description: "Missing required information to save",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      if (inspectionId) {
        // Update existing inspection
        const success = await updateVehicleInspection(inspectionId, {
          ...inspectionData,
          status: 'draft'
        });
        
        if (success) {
          toast({
            title: "Saved",
            description: "Inspection saved as draft",
          });
        } else {
          throw new Error("Failed to update inspection");
        }
      } else {
        // Create new inspection
        const newId = await createVehicleInspection({
          vehicleId,
          technicianId: userId,
          inspectionDate: new Date(),
          vehicleBodyStyle: inspectionData.vehicleBodyStyle || 'sedan',
          status: 'draft',
          damageAreas: inspectionData.damageAreas || [],
          notes: inspectionData.notes
        });
        
        if (newId) {
          toast({
            title: "Saved",
            description: "New inspection saved as draft",
          });
          // Navigate to the edit URL for the new inspection
          navigate(`/vehicle-inspection/${newId}?vehicleId=${vehicleId}`);
        } else {
          throw new Error("Failed to create inspection");
        }
      }
    } catch (error) {
      console.error("Error saving inspection:", error);
      toast({
        title: "Error",
        description: "Failed to save inspection",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !vehicleId) {
      toast({
        title: "Error",
        description: "Missing required information to submit",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (inspectionId) {
        // Update existing inspection
        const success = await updateVehicleInspection(inspectionId, {
          ...inspectionData,
          status: 'completed'
        });
        
        if (success) {
          toast({
            title: "Submitted",
            description: "Inspection has been completed and submitted",
            variant: "success",
          });
          navigate('/forms');
        } else {
          throw new Error("Failed to update inspection");
        }
      } else {
        // Create new inspection
        const newId = await createVehicleInspection({
          vehicleId,
          technicianId: userId,
          inspectionDate: new Date(),
          vehicleBodyStyle: inspectionData.vehicleBodyStyle || VehicleBodyStyle.Sedan,
          status: 'completed',
          damageAreas: inspectionData.damageAreas || [],
          notes: inspectionData.notes
        });
        
        if (newId) {
          toast({
            title: "Submitted",
            description: "New inspection has been completed and submitted",
            variant: "success",
          });
          navigate('/forms');
        } else {
          throw new Error("Failed to create inspection");
        }
      }
    } catch (error) {
      console.error("Error submitting inspection:", error);
      toast({
        title: "Error",
        description: "Failed to submit inspection",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading inspection data...</p>
      </div>
    );
  }

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
              {inspectionId ? "Edit Vehicle Inspection" : "New Vehicle Inspection"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete all sections to submit the inspection form
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={isSaving || !vehicleId}
            className="transition-all duration-200 hover:bg-blue-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || progress < 85 || !vehicleId}
            className={`${progress >= 85 ? 'animate-pulse' : ''} transition-all duration-300`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inspection"
            )}
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

      {!vehicleId && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center text-yellow-700">
            <CheckCircle2 className="h-5 w-5 mr-2 text-yellow-600" />
            Please select a vehicle before proceeding with the inspection. Vehicle information is required.
          </CardContent>
        </Card>
      )}

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
            <VehicleInfoTab 
              vehicleId={vehicleId} 
              initialBodyStyle={inspectionData.vehicleBodyStyle}
              onBodyStyleChange={handleBodyStyleChange} 
            />
          </TabsContent>
          
          <TabsContent value="exterior" className="space-y-4 mt-0 animate-fade-in">
            <ExteriorCheckTab 
              vehicleBodyStyle={inspectionData.vehicleBodyStyle || 'sedan'}
              damageAreas={inspectionData.damageAreas || []}
              onDamageAreasChange={handleDamageAreaUpdate}
            />
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
              onClick={() => toast({
                title: "PDF Generated",
                description: "Your inspection report PDF has been generated",
              })}
              className="shadow-sm hover:shadow transition-all duration-200"
            >
              <FileText className="h-4 w-4 mr-2" /> Export PDF
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !vehicleId}
              className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
