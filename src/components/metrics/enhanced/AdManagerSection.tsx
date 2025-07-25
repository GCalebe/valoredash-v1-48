import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, DollarSign, MousePointer, Users, BarChart3 } from "lucide-react";
import MetricCard from "./MetricCard";

interface AdManagerSectionProps {
  loading?: boolean;
}

const AdManagerSection: React.FC<AdManagerSectionProps> = ({ loading = false }) => {
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const platformOptions = [
    { label: "Todas as Plataformas", value: "all" },
    { label: "Facebook Ads", value: "facebook" },
    { label: "Google Ads", value: "google" },
    { label: "Instagram Ads", value: "instagram" },
  ];

  // Mock data - replace with real data from your backend
  const investmentData = [
    { date: "01/01", facebook: 1200, google: 800, instagram: 600 },
    { date: "02/01", facebook: 1500, google: 900, instagram: 750 },
    { date: "03/01", facebook: 1300, google: 1100, instagram: 680 },
    { date: "04/01", facebook: 1800, google: 950, instagram: 820 },
    { date: "05/01", facebook: 1600, google: 1200, instagram: 900 },
    { date: "06/01", facebook: 2000, google: 1050, instagram: 950 },
    { date: "07/01", facebook: 1750, google: 1300, instagram: 1100 },
  ];

  const leadsBySourceData = [
    { name: "Facebook", value: 45, color: "#1877F2" },
    { name: "Google", value: 30, color: "#4285F4" },
    { name: "Instagram", value: 20, color: "#E4405F" },
    { name: "Outros", value: 5, color: "#64748B" },
  ];

  const platformMetrics = {
    investment: 12500,
    ctr: 3.2,
    cpc: 1.85,
    cpl: 25.50,
    leads: 487,
    roas: 4.2,
  };

  const CustomTooltip = ({ active, payload, label }: unknown) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: unknown, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Métricas do Gerenciador de Anúncios
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Em tempo real</Badge>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* KPIs dos Anúncios */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              title="Investimento"
              value={`R$ ${platformMetrics.investment.toLocaleString('pt-BR')}`}
              icon={<DollarSign />}
              description="Total investido em anúncios no período selecionado"
              trend={{
                value: 8.5,
                label: "+8.5% vs período anterior",
                direction: 'up'
              }}
              iconBgClass="bg-green-100 dark:bg-green-900/30"
              iconTextClass="text-green-600 dark:text-green-400"
              loading={loading}
            />

            <MetricCard
              title="CTR"
              value={`${platformMetrics.ctr}%`}
              icon={<MousePointer />}
              description="Taxa de cliques - percentual de pessoas que clicaram no anúncio"
              trend={{
                value: 0.3,
                label: "+0.3% vs período anterior",
                direction: 'up'
              }}
              iconBgClass="bg-blue-100 dark:bg-blue-900/30"
              iconTextClass="text-blue-600 dark:text-blue-400"
              loading={loading}
            />

            <MetricCard
              title="CPC"
              value={`R$ ${platformMetrics.cpc.toFixed(2)}`}
              icon={<Target />}
              description="Custo por clique - valor médio pago por cada clique"
              trend={{
                value: -5.2,
                label: "-5.2% vs período anterior",
                direction: 'down'
              }}
              iconBgClass="bg-orange-100 dark:bg-orange-900/30"
              iconTextClass="text-orange-600 dark:text-orange-400"
              loading={loading}
            />

            <MetricCard
              title="CPL"
              value={`R$ ${platformMetrics.cpl.toFixed(2)}`}
              icon={<Users />}
              description="Custo por lead - valor médio investido para gerar um lead"
              trend={{
                value: -2.1,
                label: "-2.1% vs período anterior",
                direction: 'down'
              }}
              iconBgClass="bg-purple-100 dark:bg-purple-900/30"
              iconTextClass="text-purple-600 dark:text-purple-400"
              loading={loading}
            />

            <MetricCard
              title="Leads"
              value={platformMetrics.leads}
              icon={<Users />}
              description="Total de leads gerados através dos anúncios"
              absoluteValue={487}
              trend={{
                value: 12.3,
                label: "+12.3% vs período anterior",
                direction: 'up'
              }}
              iconBgClass="bg-emerald-100 dark:bg-emerald-900/30"
              iconTextClass="text-emerald-600 dark:text-emerald-400"
              loading={loading}
            />

            <MetricCard
              title="ROAS"
              value={`${platformMetrics.roas.toFixed(1)}x`}
              icon={<TrendingUp />}
              description="Retorno sobre investimento em anúncios"
              trend={{
                value: 15.8,
                label: "+15.8% vs período anterior",
                direction: 'up'
              }}
              iconBgClass="bg-cyan-100 dark:bg-cyan-900/30"
              iconTextClass="text-cyan-600 dark:text-cyan-400"
              loading={loading}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Investimento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investimento por Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={investmentData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs fill-muted-foreground"
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="facebook"
                      stroke="#1877F2"
                      strokeWidth={2}
                      dot={{ fill: "#1877F2", strokeWidth: 2, r: 4 }}
                      name="Facebook"
                    />
                    <Line
                      type="monotone"
                      dataKey="google"
                      stroke="#4285F4"
                      strokeWidth={2}
                      dot={{ fill: "#4285F4", strokeWidth: 2, r: 4 }}
                      name="Google"
                    />
                    <Line
                      type="monotone"
                      dataKey="instagram"
                      stroke="#E4405F"
                      strokeWidth={2}
                      dot={{ fill: "#E4405F", strokeWidth: 2, r: 4 }}
                      name="Instagram"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Leads por Fonte */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leads por Fonte</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadsBySourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leadsBySourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdManagerSection;