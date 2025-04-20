import { render, screen, fireEvent } from '@testing-library/react';
import { StatusUpdateButton } from '@/components/workOrders/StatusUpdateButton';
import { WorkOrder } from '@/types/workOrder';

const mockWorkOrder: WorkOrder = {
  id: '123',
  status: 'pending',
  // ... other required fields would go here
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
