import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Mail, Bell, Smartphone } from "lucide-react";
import type { SettingsFormData } from "../types";

interface NotificationsCardProps {
  formData: SettingsFormData;
  setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>;
}

export function NotificationsCard({ formData, setFormData }: NotificationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Notificações</CardTitle>
        </div>
        <CardDescription>Configure como você deseja receber notificações</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4" />
              <div>
                <Label>Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">Receba atualizações importantes por email</p>
              </div>
            </div>
            <Switch
              checked={formData.notifications.email}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, notifications: { ...prev.notifications, email: checked } }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4" />
              <div>
                <Label>Notificações Push</Label>
                <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
              </div>
            </div>
            <Switch
              checked={formData.notifications.push}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, notifications: { ...prev.notifications, push: checked } }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4" />
              <div>
                <Label>Notificações SMS</Label>
                <p className="text-sm text-muted-foreground">Receba alertas importantes por SMS</p>
              </div>
            </div>
            <Switch
              checked={formData.notifications.sms}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, notifications: { ...prev.notifications, sms: checked } }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4" />
              <div>
                <Label>Emails de Marketing</Label>
                <p className="text-sm text-muted-foreground">Receba dicas e novidades sobre vendas</p>
              </div>
            </div>
            <Switch
              checked={formData.notifications.marketing}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, notifications: { ...prev.notifications, marketing: checked } }))
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationsCard;


