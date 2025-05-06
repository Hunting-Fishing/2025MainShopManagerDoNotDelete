
import { renderHook, act } from '@testing-library/react-hooks';
import { useRoleManagement } from '../useRoleManagement';
import { Role } from '@/types/team';
import { defaultPermissions } from '@/data/permissionPresets';

// Mock the sub-hooks
jest.mock('../roles/useRoleFilter', () => ({
  useRoleFilter: jest.fn(() => ({
    searchQuery: '',
    setSearchQuery: jest.fn(),
    typeFilter: 'all',
    setTypeFilter: jest.fn(),
    filterRoles: jest.fn((roles) => roles),
  })),
}));

jest.mock('../roles/useRoleActions', () => ({
  useRoleActions: jest.fn(() => ({
    handleAddRole: jest.fn(() => true),
    handleEditRole: jest.fn(() => true),
    handleDeleteRole: jest.fn(() => true),
    handleDuplicateRole: jest.fn(() => true),
    handleReorderRole: jest.fn(() => true),
  })),
}));

describe('useRoleManagement', () => {
  const mockRoles: Role[] = [
    {
      id: 'role-1',
      name: 'Admin',
      description: 'Administrator role',
      isDefault: true,
      permissions: {
        ...defaultPermissions
      },
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      priority: 2
    },
    {
      id: 'role-2',
      name: 'User',
      description: 'Regular user role',
      isDefault: false,
      permissions: {
        ...defaultPermissions
      },
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      priority: 1
    }
  ];

  it('should sort roles by priority on initialization', () => {
    const { result } = renderHook(() => useRoleManagement(mockRoles));
    
    // The initial roles should be sorted by priority (role-2 first, then role-1)
    expect(result.current.roles[0].id).toBe('role-2');
    expect(result.current.roles[1].id).toBe('role-1');
  });

  it('should return all expected methods and properties', () => {
    const { result } = renderHook(() => useRoleManagement(mockRoles));
    
    // Check that all expected properties are defined
    expect(result.current.roles).toBeDefined();
    expect(result.current.filteredRoles).toBeDefined();
    expect(result.current.searchQuery).toBeDefined();
    expect(result.current.setSearchQuery).toBeDefined();
    expect(result.current.typeFilter).toBeDefined();
    expect(result.current.setTypeFilter).toBeDefined();
    expect(result.current.handleAddRole).toBeDefined();
    expect(result.current.handleEditRole).toBeDefined();
    expect(result.current.handleDeleteRole).toBeDefined();
    expect(result.current.handleDuplicateRole).toBeDefined();
    expect(result.current.handleReorderRole).toBeDefined();
  });
});
