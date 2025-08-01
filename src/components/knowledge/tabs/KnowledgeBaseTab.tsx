import React from 'react';
import { KnowledgeBase } from '../KnowledgeBase';

interface KnowledgeBaseTabProps {
  className?: string;
}

export const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({ className }) => {
  return (
    <div className={`p-6 ${className}`}>
      <KnowledgeBase />
    </div>
  );
};

export default KnowledgeBaseTab;