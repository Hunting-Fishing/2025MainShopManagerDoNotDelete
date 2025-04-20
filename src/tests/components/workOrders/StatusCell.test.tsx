import { render, screen, fireEvent } from '@testing-library/react';
import { StatusCell } from '@/components/workOrders/StatusCell';
import { WorkOrder } from '@/types/workOrder';

const mockWorkOrder: WorkOrder = {
  id: '123',
  status: 'pending',
  description: 'Test work order',
  customer: 'Test Customer',
  priority: 'medium',
  dueDate: '2023-12-31',
  createdAt: '2023-01-01',
  lastUpdatedAt: '2023-01-01',
  lastUpdatedBy: 'user-123',
  technician: 'Test Tech',
  location: 'Test Location',
  serviceType: 'Repair',
  timeEntries: [],
  inventoryItems: [],
  notes: '',
  total_cost: 0
};

const mockUserId = 'user-123';
const mockUserName = 'Test User';
const mockOnStatusUpdate = jest.fn();

describe('StatusCell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders current status', () => {
    render(
      <StatusCell
        workOrder={mockWorkOrder}
        onStatusUpdate={mockOnStatusUpdate}
        userId={mockUserId}
        userName={mockUserName}
      />
    );
    
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  test('opens dropdown on click', () => {
    render(
      <StatusCell
        workOrder={mockWorkOrder}
        onStatusUpdate={mockOnStatusUpdate}
        userId={mockUserId}
        userName={mockUserName}
      />
    );
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  test('disables current status in dropdown', () => {
    render(
      <StatusCell
        workOrder={mockWorkOrder}
        onStatusUpdate={mockOnStatusUpdate}
        userId={mockUserId}
        userName={mockUserName}
      />
    );
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    const currentStatusOption = screen.getByText('Pending');
    expect(currentStatusOption.parentElement).toHaveAttribute('aria-disabled', 'true');
  });
});
