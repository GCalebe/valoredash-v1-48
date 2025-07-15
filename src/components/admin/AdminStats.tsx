import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, Bot, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/user";

interface AdminStatsProps {
  users: User[];
  aiProducts: any[];
}

export const AdminStats: React.FC<AdminStatsProps> = ({ users, aiProducts }) => {
  const navigate = useNavigate();

  const adminCount = users.filter((u) => u.role === "admin").length;
  const uniqueAICount = Array.from(new Set(users.flatMap(u => u.ai_access))).length;

  const stats = [
    {
      title: "Usuários",
      description: "Total de usuários no sistema",
      value: users.length,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Administradores", 
      description: "Usuários com acesso admin",
      value: adminCount,
      icon: Shield,
      color: "text-accent-foreground",
    },
    {
      title: "IAs Ativas",
      description: "IAs em uso pelos usuários", 
      value: uniqueAICount,
      icon: Bot,
      color: "text-chart-2",
    },
    {
      title: "Configurações",
      description: "Opções do sistema",
      value: null,
      icon: Settings,
      color: "text-chart-4",
      action: () => navigate("/theme-settings"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              {stat.title}
            </CardTitle>
            <CardDescription>{stat.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {stat.value !== null ? (
              <div className="text-3xl font-bold">{stat.value}</div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={stat.action}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações de Tema
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};