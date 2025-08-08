import React from 'react';

interface ObjectionsTipsProps {
  count: number;
}

const ObjectionsTips: React.FC<ObjectionsTipsProps> = ({ count }) => {
  if (count <= 0) return null;
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <h4 className="font-medium text-sm mb-2">💡 Dica</h4>
      <p className="text-sm text-muted-foreground">
        Use essas respostas como base durante suas vendas. Personalize-as conforme o contexto específico de cada cliente.
      </p>
    </div>
  );
};

export default ObjectionsTips;


