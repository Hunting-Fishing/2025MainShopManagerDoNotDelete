
import React from 'react';

interface SettingsLoadingStateProps {
  message?: string;
}

export const SettingsLoadingState: React.FC<SettingsLoadingStateProps> = ({ 
  message = "Loading content..." 
}) => {
  return (
    <div className="flex items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};
