
import { useState, useEffect } from 'react';

// Define types for the CarQuery API responses
export interface CarMake {
  make_id: string;
  make_display: string;
  make_is_common: string;
  make_country: string;
}

export interface CarModel {
  model_name: string;
  model_make_id: string;
}

export interface CarYear {
  year: number;
}

export const useVehicleData = () => {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Load years (from current year back to 1950)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
    setYears(yearsList);
  }, []);

  // Fetch makes from CarQuery API
  const fetchMakes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getMakes');
      // CarQuery API uses JSONP, we need to extract the JSON from the response
      const text = await response.text();
      const jsonStr = text.substring(2, text.length - 2); // Remove the ?( and ); from JSONP
      const data = JSON.parse(jsonStr);
      
      if (data.Makes) {
        setMakes(data.Makes);
      } else {
        setError('Could not load vehicle makes');
      }
    } catch (err) {
      setError('Error loading vehicle makes. Please try again later.');
      console.error('Error fetching makes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch models for a specific make
  const fetchModels = async (make: string) => {
    if (!make) return;
    
    setLoading(true);
    setError(null);
    setSelectedMake(make);
    setSelectedModel('');
    
    try {
      const response = await fetch(`https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getModels&make=${make}`);
      const text = await response.text();
      const jsonStr = text.substring(2, text.length - 2);
      const data = JSON.parse(jsonStr);
      
      if (data.Models) {
        setModels(data.Models);
      } else {
        setError('Could not load vehicle models');
      }
    } catch (err) {
      setError('Error loading vehicle models. Please try again later.');
      console.error('Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize the hook by loading makes on first render
  useEffect(() => {
    fetchMakes();
  }, []);

  return {
    makes,
    models,
    years,
    loading,
    error,
    selectedMake,
    selectedModel,
    selectedYear,
    setSelectedModel,
    setSelectedYear,
    fetchModels
  };
};
