import { renderHook, act } from '@testing-library/react-hooks';
import { useRoleImportExport } from '../useRoleImportExport';
import { Role } from '@/types/team';
import { toast } from '@/hooks/use-toast';
import * as roleImportExport from '@/utils/roleImportExport';

// Mock validateImportedRoles function
jest.mock('@/utils/roleImportExport', () => ({
  validateImportedRoles: jest.fn(),
}));

describe('useRoleImportExport', () => {
  let mockRoles: Role[];
  let setRoles: jest.Mock;
  let mockImportedRoles: Role[];

  beforeEach(() => {
    mockRoles = [
      {
        id: 'role-1',
        name: 'Admin',
        description: 'Administrator role',
        isDefault: true,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 1
      },
      {
        id: 'role-2',
        name: 'User',
        description: 'Regular user role',
        isDefault: false,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 2
      }
    ];

    mockImportedRoles = [
      {
        id: 'role-3',
        name: 'Imported Role',
        description: 'Imported role',
        isDefault: false,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 3
      },
      {
        id: 'role-4',
        name: 'Another Imported Role',
        description: 'Another imported role',
        isDefault: false,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 4
      }
    ];

    setRoles = jest.fn();
    
    // Default validation is successful
    (roleImportExport.validateImportedRoles as jest.Mock).mockReturnValue({ valid: true });
  });

  it('should successfully import valid roles', () => {
    const { result } = renderHook(() => useRoleImportExport(mockRoles, setRoles));
    
    const success = act(() => {
      return result.current.handleImportRoles(mockImportedRoles);
    });
    
    expect(success).toBeTruthy();
    expect(setRoles).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Roles imported successfully'
    }));
    
    // Check that the roles were added with correct priorities
    const combinedRoles = setRoles.mock.calls[0][0];
    expect(combinedRoles).toHaveLength(4);
  });

  it('should reject invalid imported roles', () => {
    // Mock validation to fail
    (roleImportExport.validateImportedRoles as jest.Mock).mockReturnValue({ 
      valid: false, 
      message: 'Invalid role data' 
    });
    
    const { result } = renderHook(() => useRoleImportExport(mockRoles, setRoles));
    
    const success = act(() => {
      return result.current.handleImportRoles(mockImportedRoles);
    });
    
    expect(success).toBeFalsy();
    expect(setRoles).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Import failed',
      description: 'Invalid role data'
    }));
  });

  it('should handle duplicate role names during import', () => {
    // Create a role with the same name as an existing one
    const rolesWithDuplicate = [
      ...mockImportedRoles,
      {
        id: 'role-5',
        name: 'Admin', // Same name as existing role
        description: 'Duplicate admin role',
        isDefault: false,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 5
      }
    ];
    
    const { result } = renderHook(() => useRoleImportExport(mockRoles, setRoles));
    
    const success = act(() => {
      return result.current.handleImportRoles(rolesWithDuplicate);
    });
    
    expect(success).toBeTruthy();
    expect(setRoles).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Roles imported with warnings',
      description: expect.stringContaining('1 roles were skipped due to name conflicts')
    }));
    
    // Check that only unique roles were added
    const combinedRoles = setRoles.mock.calls[0][0];
    expect(combinedRoles).toHaveLength(4); // Original 2 + 2 new unique ones
  });

  it('should skip default roles with same IDs in imports', () => {
    // Create an imported role with the same ID as a default role
    const rolesWithDefaultRoleId = [
      {
        id: 'role-1', // Same ID as default role
        name: 'Modified Admin',
        description: 'Trying to overwrite default role',
        isDefault: true,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 1
      },
      ...mockImportedRoles
    ];
    
    const { result } = renderHook(() => useRoleImportExport(mockRoles, setRoles));
    
    act(() => {
      result.current.handleImportRoles(rolesWithDefaultRoleId);
    });
    
    // Check that the default role was not overwritten
    const combinedRoles = setRoles.mock.calls[0][0];
    const preservedDefaultRole = combinedRoles.find((r: Role) => r.id === 'role-1');
    expect(preservedDefaultRole.name).toBe('Admin'); // Original name preserved
  });

  it('should assign priorities to imported roles without priorities', () => {
    // Create roles without priorities
    const rolesWithoutPriorities = [
      {
        id: 'role-3',
        name: 'No Priority Role',
        description: 'Role without priority',
        isDefault: false,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        // No priority field
      },
      {
        id: 'role-4',
        name: 'Another No Priority Role',
        description: 'Another role without priority',
        isDefault: false,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        // No priority field
      }
    ] as Role[];
    
    const { result } = renderHook(() => useRoleImportExport(mockRoles, setRoles));
    
    act(() => {
      result.current.handleImportRoles(rolesWithoutPriorities);
    });
    
    // Check that priorities were assigned
    const combinedRoles = setRoles.mock.calls[0][0];
    const importedRoles = combinedRoles.filter((r: Role) => r.id === 'role-3' || r.id === 'role-4');
    
    expect(importedRoles[0].priority).toBe(3); // Highest existing priority + 1
    expect(importedRoles[1].priority).toBe(4); // Highest existing priority + 2
  });
});
