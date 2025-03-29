
import { renderHook, act } from '@testing-library/react-hooks';
import { useRoleFilter } from '../useRoleFilter';
import { Role } from '@/types/team';

describe('useRoleFilter', () => {
  const mockRoles: Role[] = [
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
    },
    {
      id: 'role-3',
      name: 'Custom Admin',
      description: 'Custom admin role',
      isDefault: false,
      permissions: {},
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      priority: 3
    }
  ];

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRoleFilter());
    
    expect(result.current.searchQuery).toBe('');
    expect(result.current.typeFilter).toBe('all');
  });

  it('should update search query', () => {
    const { result } = renderHook(() => useRoleFilter());
    
    act(() => {
      result.current.setSearchQuery('admin');
    });
    
    expect(result.current.searchQuery).toBe('admin');
  });

  it('should update type filter', () => {
    const { result } = renderHook(() => useRoleFilter());
    
    act(() => {
      result.current.setTypeFilter('default');
    });
    
    expect(result.current.typeFilter).toBe('default');
  });

  it('should filter roles by search query', () => {
    const { result } = renderHook(() => useRoleFilter());
    
    act(() => {
      result.current.setSearchQuery('admin');
    });
    
    const filteredRoles = result.current.filterRoles(mockRoles);
    expect(filteredRoles).toHaveLength(2);
    expect(filteredRoles[0].name).toBe('Admin');
    expect(filteredRoles[1].name).toBe('Custom Admin');
  });

  it('should filter roles by type - default', () => {
    const { result } = renderHook(() => useRoleFilter());
    
    act(() => {
      result.current.setTypeFilter('default');
    });
    
    const filteredRoles = result.current.filterRoles(mockRoles);
    expect(filteredRoles).toHaveLength(1);
    expect(filteredRoles[0].isDefault).toBe(true);
  });

  it('should filter roles by type - custom', () => {
    const { result } = renderHook(() => useRoleFilter());
    
    act(() => {
      result.current.setTypeFilter('custom');
    });
    
    const filteredRoles = result.current.filterRoles(mockRoles);
    expect(filteredRoles).toHaveLength(2);
    expect(filteredRoles[0].isDefault).toBe(false);
    expect(filteredRoles[1].isDefault).toBe(false);
  });

  it('should combine search and type filters', () => {
    const { result } = renderHook(() => useRoleFilter());
    
    act(() => {
      result.current.setSearchQuery('admin');
      result.current.setTypeFilter('custom');
    });
    
    const filteredRoles = result.current.filterRoles(mockRoles);
    expect(filteredRoles).toHaveLength(1);
    expect(filteredRoles[0].name).toBe('Custom Admin');
    expect(filteredRoles[0].isDefault).toBe(false);
  });
});
