
import React from 'react';

export const CategoryLoading: React.FC = () => {
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Loading category details...</p>
      </div>
    </div>
  );
};
