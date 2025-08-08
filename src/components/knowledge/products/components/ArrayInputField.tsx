// @ts-nocheck
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';

interface ArrayInputFieldProps {
  label: string;
  placeholder: string;
  icon: any;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}

const ArrayInputField: React.FC<ArrayInputFieldProps> = ({ label, placeholder, icon: Icon, items, onAdd, onRemove }) => {
  const [inputValue, setInputValue] = useState('');

  const addAndClear = () => {
    if (!inputValue.trim()) return;
    onAdd(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addAndClear();
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={addAndClear}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={`${item}-${index}`} variant="secondary" className="flex items-center gap-2 px-3 py-1">
            {item}
            <Button type="button" variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" onClick={() => onRemove(index)}>
              <Minus className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ArrayInputField;


