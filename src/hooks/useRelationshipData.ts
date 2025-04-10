
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface RelationshipType {
  id: string;
  label: string;
}

export function useRelationshipData() {
  const [shops, setShops] = useState<{ id: string, name: string }[]>([]);
  const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRelationshipData();
  }, []);

  const fetchRelationshipData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch shops
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('id, name')
        .order('name');
        
      if (shopsError) throw shopsError;
      setShops(shopsData.length > 0 ? shopsData : [{ id: "default-shop", name: "Main Location" }]);
      
      // Fetch relationship types
      const { data: relationshipData, error: relationshipError } = await supabase
        .from('relationship_types')
        .select('id, label')
        .order('label');
        
      if (relationshipError) throw relationshipError;
      setRelationshipTypes(relationshipData);
    } catch (err) {
      console.error('Error fetching relationship data:', err);
      setError('Failed to load relationship data');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    shops, 
    relationshipTypes, 
    isLoading, 
    error, 
    fetchRelationshipData 
  };
}
