import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wrench } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  description: string;
}

export default function CustomerPortal() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      setLoadingWorkOrders(true);
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            vehicles (*)
          `)
          .limit(5);

        if (error) {
          console.error("Error fetching work orders:", error);
        }

        if (data) {
          setWorkOrders(data);
        }
      } finally {
        setLoadingWorkOrders(false);
      }
    };

    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .limit(3);

        if (error) {
          console.error("Error fetching vehicles:", error);
        }

        if (data) {
          setVehicles(data);
        }
      } finally {
        setLoadingVehicles(false);
      }
    };

    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .limit(3);

        if (error) {
          console.error("Error fetching appointments:", error);
        }

        if (data) {
          setAppointments(data);
        }
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchWorkOrders();
    fetchVehicles();
    fetchAppointments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Your Profile</h2>
          <p>Welcome to your customer portal! Here you can manage your vehicles, appointments, and view your service history.</p>
        </div>

        {/* Vehicles Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Vehicles</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/customer-portal/vehicles">View All</Link>
            </Button>
          </div>
          
          {loadingVehicles ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-500">Loading vehicles...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Car className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium">No Vehicles Added</h3>
              <p className="text-gray-500 mt-1">Add your vehicles to keep track of their service history.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.slice(0, 2).map((vehicle) => (
                <div key={vehicle.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-sm text-gray-500">{vehicle.year} - {vehicle.license_plate}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Appointments Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Upcoming Appointments</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/customer-portal/appointments">View All</Link>
            </Button>
          </div>

          {loadingAppointments ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-500">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium">No Appointments Scheduled</h3>
              <p className="text-gray-500 mt-1">Schedule an appointment to get your vehicle serviced.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 2).map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{appointment.description}</h3>
                  <p className="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work Orders Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Work Orders</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/customer-portal/work-orders">View All</Link>
            </Button>
          </div>
          
          {loadingWorkOrders ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-500">Loading work orders...</p>
            </div>
          ) : workOrders.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium">No Work Orders Yet</h3>
              <p className="text-gray-500 mt-1">You don't have any service history with us yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workOrders.slice(0, 3).map((workOrder) => (
                <Link
                  key={workOrder.id}
                  to={`/customer-portal/work-orders/${workOrder.id}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{workOrder.description || `Work Order #${workOrder.id.substring(0, 8)}`}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {workOrder.createdAt ? format(new Date(workOrder.createdAt), 'MMM dd, yyyy') : 
                         workOrder.created_at ? format(new Date(workOrder.created_at), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                      <p className="text-sm mt-1">
                        {workOrder.vehicleDetails ? 
                          `${workOrder.vehicleDetails.year || ''} ${workOrder.vehicleDetails.make || ''} ${workOrder.vehicleDetails.model || ''}` : 
                         workOrder.vehicle_make && workOrder.vehicle_model ? 
                          `${workOrder.vehicle_make} ${workOrder.vehicle_model}` : 
                          'Unknown vehicle'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(workOrder.status)}>
                      {workOrder.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
