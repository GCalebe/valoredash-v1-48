import React from 'react';

interface SectionHeaderProps {
  title: string;
  borderColor: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  borderColor,
}) => {
  return (
    <h4 className={`text-lg font-semibold text-gray-700 dark:text-gray-300 border-b-2 ${borderColor} pb-2`}>
      {title}
    </h4>
  );
};

export default SectionHeader;