import React from 'react';

interface ValidationErrorsProps {
  validationErrors: Record<string, string>;
}

const ValidationErrors = React.memo(({ validationErrors }: ValidationErrorsProps) => {
  if (Object.keys(validationErrors).length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <h4 className="text-sm font-medium text-red-800 mb-2">
        Erros de validação:
      </h4>
      <ul className="text-sm text-red-700 space-y-1">
        {Object.entries(validationErrors).map(([fieldId, error]) => (
          <li key={fieldId}>• {error}</li>
        ))}
      </ul>
    </div>
  );
});

ValidationErrors.displayName = 'ValidationErrors';

export default ValidationErrors;