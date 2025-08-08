import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonalityConfig, PERSONALITY_CATEGORIES } from '../index';
import { User } from 'lucide-react';

interface BasicInfoSectionProps {
  config: PersonalityConfig;
  onChange: (field: keyof PersonalityConfig, value: any) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ config, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Personalidade</Label>
          <Input id="name" value={config.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Ex: Assistente Criativo" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            id="description"
            value={config.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Descreva o propósito e características desta personalidade..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={config.category} onValueChange={(value) => onChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {PERSONALITY_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;


