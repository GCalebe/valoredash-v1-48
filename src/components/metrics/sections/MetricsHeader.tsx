import React from 'react';

interface MetricsHeaderProps {
  title: string;
  description: string;
}

const MetricsHeader: React.FC<MetricsHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-xl p-6 text-white">
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-blue-100 dark:text-blue-200">{description}</p>
    </div>
  );
};

export default MetricsHeader;