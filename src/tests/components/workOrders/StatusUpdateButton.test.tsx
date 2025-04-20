
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusUpdateButton } from '@/components/workOrders/StatusUpdateButton';
import { WorkOrder } from '@/types/workOrder';

const mockWorkOrder: WorkOrder = {
  id: '123',
  status: 'pending',
  description: 'Test work order',
  customer: 'Test Customer',
  priority: 'medium',
  dueDate: '2023-12-31',
  technician: 'Test Tech',
  date: '2023-01-01',
  location: 'Test Location',
  notes: '',
  inventoryItems: [],
  timeEntries: [],
  createdAt: '2023-01-01',
  lastUpdatedAt: '2023-01-01',
  lastUpdatedBy: 'user-123',
  total_cost: 0,
  serviceType: 'Repair'
};

const mockUserId = 'user-123';
const mockUserName = 'Test User';
const mockOnStatusUpdate = jest.fn();

describe('StatusUpdateButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct status label', () => {
    render(
      <StatusUpdateButton
        workOrder={mockWorkOrder}
        newStatus="in-progress"
        userId={mockUserId}
        userName={mockUserName}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );
    
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
  });

  test('shows automation indicator when specified', () => {
    render(
      <StatusUpdateButton
        workOrder={mockWorkOrder}
        newStatus="in-progress"
        userId={mockUserId}
        userName={mockUserName}
        onStatusUpdate={mockOnStatusUpdate}
        showAutomation={true}
      />
    );
    
    expect(screen.getByText(/automating/i)).toBeInTheDocument();
  });

  test('disables button when updating', () => {
    render(
      <StatusUpdateButton
        workOrder={mockWorkOrder}
        newStatus="in-progress"
        userId={mockUserId}
        userName={mockUserName}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
  });

  test('handles different button sizes', () => {
    render(
      <StatusUpdateButton
        workOrder={mockWorkOrder}
        newStatus="in-progress"
        userId={mockUserId}
        userName={mockUserName}
        onStatusUpdate={mockOnStatusUpdate}
        size="sm"
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-sm');
  });
});
