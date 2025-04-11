
import { useState, useEffect } from 'react';

// Define relationship type
export interface RelationshipType {
  id: string;
  label: string;
}

export function useRelationshipData() {
  const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelationshipTypes = async () => {
      setIsLoading(true);
      try {
        // Instead of querying a table that doesn't exist, return mock data
        // In a real app, we would fetch from the database
        // const { data, error } = await supabase
        //   .from('relationship_types')
        //   .select('id, label');
        
        // if (error) throw error;
        
        // Mock data
        const mockData: RelationshipType[] = [
          { id: '1', label: 'Spouse' },
          { id: '2', label: 'Child' },
          { id: '3', label: 'Parent' },
          { id: '4', label: 'Sibling' },
          { id: '5', label: 'Friend' },
          { id: '6', label: 'Other' }
        ];
        
        setRelationshipTypes(mockData);
        setError(null);
      } catch (err) {
        console.error('Error fetching relationship types:', err);
        setError('Failed to load relationship types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelationshipTypes();
  }, []);

  return { relationshipTypes, isLoading, error };
}
