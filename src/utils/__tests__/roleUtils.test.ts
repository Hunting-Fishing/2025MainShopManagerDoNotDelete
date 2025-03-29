
import { validateImportedRoles, exportRolesToJson } from '@/utils/roleUtils';
import { Role } from '@/types/team';

describe('validateImportedRoles', () => {
  it('should validate a valid array of roles', () => {
    const validRoles: Role[] = [
      {
        id: 'role-1',
        name: 'Admin',
        description: 'Administrator role',
        isDefault: true,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 1
      }
    ];
    
    const result = validateImportedRoles(validRoles);
    expect(result.valid).toBe(true);
  });
  
  it('should reject non-array inputs', () => {
    const nonArrayInput = {} as any;
    
    const result = validateImportedRoles(nonArrayInput);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('not a valid array');
  });
  
  it('should reject empty arrays', () => {
    const emptyArray: Role[] = [];
    
    const result = validateImportedRoles(emptyArray);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('No roles found');
  });
  
  it('should reject roles missing required properties', () => {
    const invalidRoles = [
      {
        // Missing id
        name: 'Admin',
        description: 'Administrator role',
        isDefault: true,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 1
      }
    ];
    
    const result = validateImportedRoles(invalidRoles as Role[]);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('missing required properties');
  });
  
  it('should add priority to roles without it', () => {
    const rolesWithoutPriority = [
      {
        id: 'role-1',
        name: 'Admin',
        description: 'Administrator role',
        isDefault: true,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
        // No priority
      }
    ] as Role[];
    
    validateImportedRoles(rolesWithoutPriority);
    
    // Check that priority was added
    expect(rolesWithoutPriority[0].priority).toBe(999);
  });
});

describe('exportRolesToJson', () => {
  // We need to mock document features
  let createElementSpy: jest.SpyInstance;
  let appendChildSpy: jest.SpyInstance;
  let clickSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let createObjectURLSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;
  
  beforeEach(() => {
    // Mock link element and its methods
    clickSpy = jest.fn();
    createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(() => ({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLElement));
    
    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(jest.fn());
    removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(jest.fn());
    
    // Mock URL methods
    createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('mock-url');
    revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(jest.fn());
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('should export roles to a JSON file', () => {
    const roles: Role[] = [
      {
        id: 'role-1',
        name: 'Admin',
        description: 'Administrator role',
        isDefault: true,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 1
      }
    ];
    
    exportRolesToJson(roles, 'test-roles');
    
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });
  
  it('should use the default filename if none provided', () => {
    const roles: Role[] = [
      {
        id: 'role-1',
        name: 'Admin',
        description: 'Administrator role',
        isDefault: true,
        permissions: {},
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        priority: 1
      }
    ];
    
    exportRolesToJson(roles); // No filename provided
    
    // Verify download contains default name
    const linkElement = createElementSpy.mock.results[0].value;
    expect(linkElement.download).toContain('team-roles-');
  });
});
