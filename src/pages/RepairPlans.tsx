
import { RepairPlansList } from "@/components/repair-plan/RepairPlansList";
import { RepairPlan } from "@/types/repairPlan";
import { v4 as uuidv4 } from "uuid";

// Mock data for repair plans (replace with real data in production)
const mockRepairPlans: RepairPlan[] = [
  {
    id: "repair-1",
    equipmentId: "equipment-1",
    title: "HVAC System Overhaul",
    description: "Complete overhaul of the HVAC system including compressor replacement and ductwork inspection.",
    status: "scheduled",
    priority: "high",
    createdAt: "2023-11-01T10:00:00Z",
    updatedAt: "2023-11-02T14:30:00Z",
    scheduledDate: "2023-11-15",
    estimatedDuration: 8,
    assignedTechnician: "Michael Brown",
    costEstimate: 1250.00,
    customerApproved: true,
    notes: "Customer requested the work to be done before the holiday season.",
    tasks: [
      {
        id: uuidv4(),
        description: "Remove old compressor",
        estimatedHours: 1.5,
        completed: false,
        assignedTo: "Michael Brown",
      },
      {
        id: uuidv4(),
        description: "Install new compressor",
        estimatedHours: 2,
        completed: false,
        assignedTo: "Michael Brown",
      },
      {
        id: uuidv4(),
        description: "Inspect ductwork",
        estimatedHours: 2.5,
        completed: false,
        assignedTo: "Sarah Johnson",
      },
      {
        id: uuidv4(),
        description: "Clean air handler",
        estimatedHours: 1,
        completed: false,
        assignedTo: "David Lee",
      },
    ],
  },
  {
    id: "repair-2",
    equipmentId: "equipment-2",
    title: "Generator Fuel System Maintenance",
    description: "Inspect and maintain fuel system components including filters, pumps, and injectors.",
    status: "in-progress",
    priority: "medium",
    createdAt: "2023-10-25T09:15:00Z",
    updatedAt: "2023-11-01T11:20:00Z",
    scheduledDate: "2023-11-05",
    estimatedDuration: 4,
    assignedTechnician: "Sarah Johnson",
    costEstimate: 650.00,
    customerApproved: true,
    tasks: [
      {
        id: uuidv4(),
        description: "Replace fuel filters",
        estimatedHours: 1,
        completed: true,
        assignedTo: "Sarah Johnson",
      },
      {
        id: uuidv4(),
        description: "Clean injectors",
        estimatedHours: 1.5,
        completed: true,
        assignedTo: "Sarah Johnson",
      },
      {
        id: uuidv4(),
        description: "Test fuel pump",
        estimatedHours: 1,
        completed: false,
        assignedTo: "Sarah Johnson",
      },
    ],
  },
  {
    id: "repair-3",
    equipmentId: "equipment-3",
    title: "Elevator Control Panel Repair",
    description: "Troubleshoot and repair malfunctioning elevator control panel.",
    status: "draft",
    priority: "critical",
    createdAt: "2023-11-03T14:30:00Z",
    updatedAt: "2023-11-03T14:30:00Z",
    estimatedDuration: 6,
    assignedTechnician: "David Lee",
    costEstimate: 1800.00,
    customerApproved: false,
    tasks: [
      {
        id: uuidv4(),
        description: "Diagnose control panel issues",
        estimatedHours: 2,
        completed: false,
        assignedTo: "David Lee",
      },
      {
        id: uuidv4(),
        description: "Replace faulty components",
        estimatedHours: 3,
        completed: false,
        assignedTo: "David Lee",
      },
      {
        id: uuidv4(),
        description: "Test elevator operation",
        estimatedHours: 1,
        completed: false,
        assignedTo: "David Lee",
      },
    ],
  },
  {
    id: "repair-4",
    equipmentId: "equipment-4",
    title: "Industrial Oven Heating Element Replacement",
    description: "Replace failing heating elements in the industrial baking oven.",
    status: "completed",
    priority: "high",
    createdAt: "2023-10-15T08:45:00Z",
    updatedAt: "2023-10-20T16:30:00Z",
    scheduledDate: "2023-10-18",
    completedDate: "2023-10-20",
    estimatedDuration: 5,
    actualDuration: 6,
    assignedTechnician: "Emily Chen",
    costEstimate: 950.00,
    customerApproved: true,
    tasks: [
      {
        id: uuidv4(),
        description: "Disconnect power and remove access panels",
        estimatedHours: 1,
        completed: true,
        assignedTo: "Emily Chen",
      },
      {
        id: uuidv4(),
        description: "Remove old heating elements",
        estimatedHours: 1.5,
        completed: true,
        assignedTo: "Emily Chen",
      },
      {
        id: uuidv4(),
        description: "Install new heating elements",
        estimatedHours: 2,
        completed: true,
        assignedTo: "Emily Chen",
      },
      {
        id: uuidv4(),
        description: "Test operation and recalibrate",
        estimatedHours: 0.5,
        completed: true,
        assignedTo: "Emily Chen",
      },
    ],
  },
];

export default function RepairPlans() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Repair Plans</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage repair plans for equipment maintenance and repairs.
        </p>
      </div>
      
      <RepairPlansList repairPlans={mockRepairPlans} />
    </div>
  );
}
