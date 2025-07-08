
import React from "react";
import { useScheduleMetrics } from "@/hooks/useScheduleMetrics";
import { ScheduleEvent } from "@/hooks/useScheduleData";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, CheckCircle, Clock, Target } from "lucide-react";

interface ScheduleMetricsCardsProps {
  scheduleEvents: ScheduleEvent[];
}

export function ScheduleMetricsCards({ scheduleEvents }: ScheduleMetricsCardsProps) {
  const { settings } = useThemeSettings();
  const metrics = useScheduleMetrics(scheduleEvents);

  const metricsData = [
    { 
      label: "Hoje", 
      value: metrics.today, 
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Esta Semana", 
      value: metrics.thisWeek, 
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      label: "Este Mês", 
      value: metrics.thisMonth, 
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      label: "Confirmados", 
      value: metrics.confirmed, 
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    { 
      label: "Total", 
      value: metrics.total, 
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-6 px-6 py-4">
      {metricsData.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <Card key={metric.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
