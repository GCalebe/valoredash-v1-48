import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, Users, TrendingUp } from "lucide-react";
import { User } from "@/types/user";

interface AIAccessTabProps {
  users: User[];
  aiProducts: unknown[];
}

export const AIAccessTab: React.FC<AIAccessTabProps> = ({
  users,
  aiProducts,
}) => {
  // Calculate AI usage statistics
  const aiUsageStats = aiProducts
    .map((product) => {
      const usersWithAccess = users.filter((user) =>
        user.ai_access.includes(product.id),
      );
      const percentage =
        users.length > 0 ? (usersWithAccess.length / users.length) * 100 : 0;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        usersCount: usersWithAccess.length,
        percentage: Math.round(percentage),
        users: usersWithAccess,
      };
    })
    .sort((a, b) => b.usersCount - a.usersCount);

  const totalAIAccess = users.reduce(
    (acc, user) => acc + user.ai_access.length,
    0,
  );
  const averageAIPerUser =
    users.length > 0 ? Math.round((totalAIAccess / users.length) * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              IAs Disponíveis
            </CardTitle>
            <CardDescription>Total de IAs no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aiProducts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-chart-2" />
              Total de Acessos
            </CardTitle>
            <CardDescription>Acessos distribuídos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAIAccess}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-4" />
              Média por Usuário
            </CardTitle>
            <CardDescription>IAs por usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageAIPerUser}</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Uso das IAs por Usuários
          </CardTitle>
          <CardDescription>
            Estatísticas de acesso às IAs disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {aiUsageStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma IA encontrada no sistema
              </div>
            ) : (
              aiUsageStats.map((ai) => (
                <div key={ai.id} className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{ai.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {ai.description || "IA sem descrição"}
                        </p>
                        {ai.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {ai.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{ai.usersCount}</div>
                      <div className="text-sm text-muted-foreground">
                        usuários ({ai.percentage}%)
                      </div>
                    </div>
                  </div>

                  <Progress value={ai.percentage} className="h-2" />

                  {ai.users.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ai.users.slice(0, 5).map((user) => (
                        <Badge
                          key={user.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {user.full_name || user.email}
                        </Badge>
                      ))}
                      {ai.users.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{ai.users.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
