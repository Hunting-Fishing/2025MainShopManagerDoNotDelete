
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Car, Plus } from "lucide-react";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: string;
  vin?: string;
  license_plate?: string;
  mileage?: number;
  color?: string;
}

type VehicleFormData = {
  make: string;
  model: string;
  year: string;
  vin: string;
  license_plate: string;
  mileage: number;
  color: string;
}

export function CustomerVehicles() {
  const { userId } = useAuthUser();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VehicleFormData>({
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear().toString(),
      vin: '',
      license_plate: '',
      mileage: 0,
      color: '',
    }
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('customer_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setVehicles(data);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [userId]);

  const onSubmit = async (data: VehicleFormData) => {
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      const { data: newVehicle, error } = await supabase
        .from('vehicles')
        .insert([
          { 
            ...data,
            customer_id: userId
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setVehicles(prev => [newVehicle, ...prev]);
      setIsDialogOpen(false);
      reset();
      
      toast({
        title: "Vehicle Added",
        description: "Your vehicle has been successfully added.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Your Vehicles</h2>
          <p className="text-muted-foreground">
            Manage the vehicles associated with your account.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Car className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No vehicles found</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              You haven't added any vehicles yet. Add a vehicle to book service appointments.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
              Add Your First Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.color && (
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: vehicle.color }}
                      title={vehicle.color}
                    ></div>
                  )}
                </div>
                
                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  {vehicle.license_plate && (
                    <div className="flex justify-between">
                      <span>License Plate:</span>
                      <span className="font-medium">{vehicle.license_plate}</span>
                    </div>
                  )}
                  
                  {vehicle.vin && (
                    <div className="flex justify-between">
                      <span>VIN:</span>
                      <span className="font-medium">{vehicle.vin}</span>
                    </div>
                  )}
                  
                  {vehicle.mileage && (
                    <div className="flex justify-between">
                      <span>Mileage:</span>
                      <span className="font-medium">{vehicle.mileage.toLocaleString()} mi</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
            <DialogDescription>
              Add a new vehicle to your account to enable scheduling service appointments.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input 
                    id="year" 
                    {...register("year", { required: true })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="make">Make</Label>
                  <Input 
                    id="make" 
                    {...register("make", { required: true })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="model">Model</Label>
                <Input 
                  id="model" 
                  {...register("model", { required: true })}
                />
              </div>
              
              <div>
                <Label htmlFor="vin">VIN (Optional)</Label>
                <Input 
                  id="vin" 
                  {...register("vin")}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_plate">License Plate (Optional)</Label>
                  <Input 
                    id="license_plate" 
                    {...register("license_plate")}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color (Optional)</Label>
                  <Input 
                    id="color" 
                    type="text"
                    {...register("color")}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="mileage">Mileage (Optional)</Label>
                <Input 
                  id="mileage" 
                  type="number"
                  {...register("mileage", { min: 0, valueAsNumber: true })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
