import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ 
  title = 'Something went wrong', 
  message, 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`bg-red-500/10 border border-red-500/20 rounded-xl p-6 ${className}`}>
      <div className="text-red-400 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        {message && <p className="text-sm mb-4">{message}</p>}
        {onRetry && (
          <button 
            onClick={onRetry}
            className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;