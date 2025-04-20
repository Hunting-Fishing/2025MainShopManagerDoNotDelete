
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/workOrders/StatusBadge';
import { WorkOrder } from '@/types/workOrder';

describe('StatusBadge', () => {
  const statuses: WorkOrder['status'][] = ['pending', 'in-progress', 'completed', 'cancelled'];

  test.each(statuses)('renders %s status correctly', (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('shows icon by default', () => {
    render(<StatusBadge status="pending" />);
    const icon = screen.getByTestId('status-icon');
    expect(icon).toBeInTheDocument();
  });

  test('hides icon when showIcon is false', () => {
    render(<StatusBadge status="pending" showIcon={false} />);
    const icon = screen.queryByTestId('status-icon');
    expect(icon).not.toBeInTheDocument();
  });

  test('applies custom className', () => {
    const customClass = 'custom-test-class';
    render(<StatusBadge status="pending" className={customClass} />);
    expect(screen.getByRole('status')).toHaveClass(customClass);
  });
});
