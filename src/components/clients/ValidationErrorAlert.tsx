import React from "react";
import { AlertCircle } from "lucide-react";

interface ValidationErrorAlertProps {
  errors: { [key: string]: string };
}

const ValidationErrorAlert = ({ errors }: ValidationErrorAlertProps) => {
  if (Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">Corrija os seguintes erros:</span>
      </div>
      <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 mt-2">
        {Object.values(errors).map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationErrorAlert;
