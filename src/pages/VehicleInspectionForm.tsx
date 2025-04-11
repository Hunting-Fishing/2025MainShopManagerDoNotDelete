
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VehicleInfoTab } from "@/components/inspection-form/VehicleInfoTab";
import { DamageAssessmentTab } from "@/components/inspection-form/DamageAssessmentTab";
import { AdditionalNotesTab } from "@/components/inspection-form/AdditionalNotesTab";
import { VehicleBodyStyle } from "@/types/vehicleBodyStyles";

interface InspectionFormData {
  vin: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  color: string;
  bodyStyle: VehicleBodyStyle;
  mileage: string;
}

interface VehicleInspectionFormProps {
  vehicleId?: string;
}

export default function VehicleInspectionForm({ vehicleId }: VehicleInspectionFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InspectionFormData>({
    vin: "",
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    color: "",
    bodyStyle: "sedan" as VehicleBodyStyle,
    mileage: ""
  });

  const handleVehicleInfoChange = (newInfo: InspectionFormData) => {
    setFormData(newInfo);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'bodyStyle') {
      const validBodyStyle = value as VehicleBodyStyle;
      setFormData(prev => ({ ...prev, [name]: validBodyStyle }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleBodyStyleChange = (style: VehicleBodyStyle) => {
    setFormData(prev => ({ ...prev, bodyStyle: style }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Inspection Submitted",
        description: "Vehicle inspection form has been submitted successfully.",
      });

      navigate("/vehicles");
    } catch (error) {
      console.error("Error submitting inspection:", error);
      toast({
        title: "Error",
        description: "Failed to submit vehicle inspection form.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Inspection Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vehicle-info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vehicle-info">Vehicle Information</TabsTrigger>
              <TabsTrigger value="damage-assessment">Damage Assessment</TabsTrigger>
              <TabsTrigger value="additional-notes">Additional Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="vehicle-info" className="space-y-4">
              <VehicleInfoTab
                vehicleInfo={formData}
                onVehicleInfoChange={handleVehicleInfoChange}
                initialBodyStyle={formData.bodyStyle}
                onBodyStyleChange={handleBodyStyleChange}
              />
            </TabsContent>
            <TabsContent value="damage-assessment">
              <DamageAssessmentTab />
            </TabsContent>
            <TabsContent value="additional-notes">
              <AdditionalNotesTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Inspection"
          )}
        </Button>
      </div>
    </div>
  );
}
