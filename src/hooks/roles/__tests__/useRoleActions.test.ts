
import { renderHook, act } from '@testing-library/react-hooks';
import { useRoleActions } from '../useRoleActions';
import { Role } from '@/types/team';
import { PermissionSet } from '@/types/permissions';
import { toast } from 'sonner';
import { defaultPermissions } from '@/data/permissionPresets';

// Mock UUID generation for predictable IDs in tests
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid')
}));

describe('useRoleActions', () => {
  let mockRoles: Role[];
  let setRoles: jest.Mock;

  beforeEach(() => {
    mockRoles = [
      {
        id: 'role-1',
        name: 'Admin',
        description: 'Administrator role',
        isDefault: true,
        permissions: { 
          ...defaultPermissions,
          workOrders: { ...defaultPermissions.workOrders, view: true }
        },
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 1
      },
      {
        id: 'role-2',
        name: 'User',
        description: 'Regular user role',
        isDefault: false,
        permissions: { 
          ...defaultPermissions,
          workOrders: { ...defaultPermissions.workOrders, view: true }
        },
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 2
      }
    ];
    setRoles = jest.fn();
  });

  it('should add a new role', () => {
    const { result } = renderHook(() => useRoleActions(mockRoles, setRoles));
    
    const testPermissions: PermissionSet = {
      ...defaultPermissions,
      workOrders: { ...defaultPermissions.workOrders, view: true }
    };
    
    const success = act(() => {
      return result.current.handleAddRole('New Role', 'A new role description', testPermissions);
    });
    
    expect(success).toBeTruthy();
    expect(setRoles).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Role created successfully'
    }));
    
    // Check that the new role has the highest priority
    const newRolesArg = setRoles.mock.calls[0][0];
    const newRole = newRolesArg.find((r: Role) => r.name === 'New Role');
    expect(newRole.priority).toBe(3);
  });

  it('should prevent adding a role with an existing name', () => {
    const { result } = renderHook(() => useRoleActions(mockRoles, setRoles));
    
    const testPermissions: PermissionSet = {
      ...defaultPermissions,
      workOrders: { ...defaultPermissions.workOrders, view: true }
    };
    
    const success = act(() => {
      return result.current.handleAddRole('Admin', 'Duplicate name', testPermissions);
    });
    
    expect(success).toBeFalsy();
    expect(setRoles).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Role already exists'
    }));
  });

  it('should edit an existing role', () => {
    const { result } = renderHook(() => useRoleActions(mockRoles, setRoles));
    const updatedRole = { ...mockRoles[1], name: 'Updated User Role' };
    
    const newPermissions: PermissionSet = {
      ...defaultPermissions,
      workOrders: { ...defaultPermissions.workOrders, view: true, create: true }
    };
    
    const success = act(() => {
      return result.current.handleEditRole(updatedRole, newPermissions);
    });
    
    expect(success).toBeTruthy();
    expect(setRoles).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Role updated successfully'
    }));
  });

  it('should delete a non-default role', () => {
    const { result } = renderHook(() => useRoleActions(mockRoles, setRoles));
    
    const success = act(() => {
      return result.current.handleDeleteRole(mockRoles[1]);
    });
    
    expect(success).toBeTruthy();
    expect(setRoles).toHaveBeenCalledWith(expect.arrayContaining([mockRoles[0]]));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Role deleted successfully'
    }));
  });

  it('should prevent deleting a default role', () => {
    const { result } = renderHook(() => useRoleActions(mockRoles, setRoles));
    
    const success = act(() => {
      return result.current.handleDeleteRole(mockRoles[0]);
    });
    
    expect(success).toBeFalsy();
    expect(setRoles).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Cannot delete default role'
    }));
  });

  it('should duplicate a role', () => {
    const { result } = renderHook(() => useRoleActions(mockRoles, setRoles));
    
    const success = act(() => {
      return result.current.handleDuplicateRole(mockRoles[0]);
    });
    
    expect(success).toBeTruthy();
    expect(setRoles).toHaveBeenCalled();
    
    // Check that the duplicated role has proper name and highest priority
    const newRolesArg = setRoles.mock.calls[0][0];
    const duplicatedRole = newRolesArg.find((r: Role) => r.name === 'Admin (Copy)');
    expect(duplicatedRole).toBeDefined();
    expect(duplicatedRole.isDefault).toBe(false);
    expect(duplicatedRole.priority).toBe(3);
  });

  it('should reorder roles by moving a role up', () => {
    const { result } = renderHook(() => useRoleActions(mockRoles, setRoles));
    
    const success = act(() => {
      return result.current.handleReorderRole('role-2', 'up');
    });
    
    expect(success).toBeTruthy();
    expect(setRoles).toHaveBeenCalled();
    
    // Verify priorities were swapped
    const newRolesArg = setRoles.mock.calls[0][0];
    expect(newRolesArg.find((r: Role) => r.id === 'role-1').priority).toBe(2);
    expect(newRolesArg.find((r: Role) => r.id === 'role-2').priority).toBe(1);
  });

  it('should reorder roles by moving a role down', () => {
    const { result } = renderHook(() => useRoleActions(mockRoles, setRoles));
    
    const success = act(() => {
      return result.current.handleReorderRole('role-1', 'down');
    });
    
    expect(success).toBeTruthy();
    expect(setRoles).toHaveBeenCalled();
    
    // Verify priorities were swapped
    const newRolesArg = setRoles.mock.calls[0][0];
    expect(newRolesArg.find((r: Role) => r.id === 'role-1').priority).toBe(2);
    expect(newRolesArg.find((r: Role) => r.id === 'role-2').priority).toBe(1);
  });

  it('should not allow moving a role beyond boundaries', () => {
    const { result } = renderHook(() => useRoleActions(mockRoles, setRoles));
    
    // Try to move the first role up
    const upSuccess = act(() => {
      return result.current.handleReorderRole('role-1', 'up');
    });
    
    expect(upSuccess).toBeFalsy();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Cannot move role up'
    }));
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Try to move the last role down
    const downSuccess = act(() => {
      return result.current.handleReorderRole('role-2', 'down');
    });
    
    expect(downSuccess).toBeFalsy();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Cannot move role down'
    }));
  });
});
