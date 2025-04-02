
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "./CustomerFormSchema";
import { FormControl } from "@/components/ui/form";

interface AddressAutocompleteProps {
  form: UseFormReturn<CustomerFormValues>;
  field: any;
  disabled?: boolean;
}

// This component uses the browser's Geolocation API for address autocomplete
export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ form, field, disabled }) => {
  const [predictions, setPredictions] = useState<Array<{ description: string; place_id: string }>>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [inputValue, setInputValue] = useState(field.value || "");
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Set up click outside listener to close predictions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to fetch address predictions
  const fetchAddressPredictions = async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      return;
    }

    try {
      // In a real implementation, you would make an API call to a geocoding service here
      // For demo purposes, we'll simulate some predictions based on the input
      const mockPredictions = [
        { description: `${input}, Main Street`, place_id: "place-1" },
        { description: `${input}, Broadway Avenue`, place_id: "place-2" },
        { description: `${input}, Oak Road`, place_id: "place-3" }
      ];

      // Delayed to simulate API call
      setTimeout(() => {
        setPredictions(mockPredictions);
        setShowPredictions(input.length > 0);
      }, 300);
    } catch (error) {
      console.error("Error fetching address predictions:", error);
      setPredictions([]);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    field.onChange(value);
    fetchAddressPredictions(value);
  };

  // Handle prediction selection
  const handleSelectPrediction = (prediction: { description: string; place_id: string }) => {
    setInputValue(prediction.description);
    field.onChange(prediction.description);
    setShowPredictions(false);
  };

  return (
    <div className="relative" ref={autocompleteRef}>
      <Input
        placeholder="Enter address"
        {...field}
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-full"
      />

      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectPrediction(prediction)}
            >
              {prediction.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
