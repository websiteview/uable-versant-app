import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message = "Loading...", isLoading = true }) => {
  const [visible, setVisible] = useState(isLoading);

  useEffect(() => {
    if (!isLoading) {
      // Allow for a brief fade out transition if needed, 
      // but ensure it dismisses when isLoading is false
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 fixed inset-0 z-50">
      <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        </div>
        <p className="text-lg font-medium text-indigo-900">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;