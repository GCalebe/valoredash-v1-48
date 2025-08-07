import React, { memo } from 'react';
import { Contact } from '@/types/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';

interface ContactPreviewProps {
  contact: Contact;
  customFields?: Array<{ field_name: string; value: any }>;
  compact?: boolean;
}

const ContactPreview = memo(({ contact, customFields = [], compact = false }: ContactPreviewProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (compact) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {contact.name}
              </p>
              {contact.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {contact.email}
                </p>
              )}
              {contact.phone && (
                <p className="text-xs text-muted-foreground">
                  {contact.phone}
                </p>
              )}
            </div>
          </div>
          
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {contact.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {contact.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{contact.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-semibold">{contact.name}</CardTitle>
            {contact.clientName && (
              <p className="text-muted-foreground mt-1">{contact.clientName}</p>
            )}
            {contact.consultationStage && (
              <Badge variant="outline" className="mt-2">
                {contact.consultationStage}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contact.email && (
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{contact.email}</span>
            </div>
          )}
          
          {contact.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{contact.phone}</span>
            </div>
          )}
          
          {contact.address && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{contact.address}</span>
            </div>
          )}
          
          {contact.created_at && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Criado em {formatDate(contact.created_at)}</span>
            </div>
          )}
        </div>

        {/* Financial Information */}
        {(contact.sales || contact.budget) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            {contact.sales && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <span className="font-medium">Vendas:</span> {formatCurrency(contact.sales)}
                </span>
              </div>
            )}
            
            {contact.budget && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  <span className="font-medium">Orçamento:</span> {formatCurrency(contact.budget)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Tags:</p>
            <div className="flex flex-wrap gap-1">
              {contact.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Campos Personalizados:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {customFields.map((field, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-muted-foreground">{field.field_name}:</span>
                  <span className="ml-2">
                    {Array.isArray(field.value) 
                      ? field.value.join(', ') 
                      : field.value?.toString() || '-'
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Observações:</p>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              {contact.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ContactPreview.displayName = 'ContactPreview';

export default ContactPreview;