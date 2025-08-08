// @ts-nocheck
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Edit, Trash2, Calendar } from "lucide-react";

interface HostItem {
  id: string;
  name: string;
  role: string;
  description?: string | null;
}

interface HostsGridProps {
  hosts: HostItem[];
  getAgendaNames: (hostId: string) => string[];
  onEdit: (host: HostItem) => void;
  onDelete: (hostId: string) => void;
}

export const HostsGrid: React.FC<HostsGridProps> = ({ hosts, getAgendaNames, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hosts.map((host) => (
        <Card key={host.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-base">{host.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs mt-1">{host.role}</Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(host)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(host.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {host.description && <p className="text-sm text-muted-foreground">{host.description}</p>}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Agendas:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {getAgendaNames(host.id).length > 0 ? (
                  getAgendaNames(host.id).map((name, index) => <Badge key={`${host.id}-${index}`} variant="outline">{name}</Badge>)
                ) : (
                  <span className="text-xs text-muted-foreground">Nenhuma agenda associada</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HostsGrid;


