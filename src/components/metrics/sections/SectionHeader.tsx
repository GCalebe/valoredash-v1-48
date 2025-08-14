import React from 'react';

interface SectionHeaderProps {
  title: string;
  borderColor: string;
  children?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  borderColor,
  children,
}) => {
  return (
    <div className="flex items-center justify-between">
      <h4 className={`text-lg font-semibold text-gray-700 dark:text-gray-300 border-b-2 ${borderColor} pb-2`}>
        {title}
      </h4>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;