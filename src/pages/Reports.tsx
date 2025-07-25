import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Calendar, Download, Filter } from 'lucide-react';

interface ReportMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

const mockMetrics: ReportMetric[] = [
  {
    title: 'Total de Clientes',
    value: '247',
    change: '+12%',
    trend: 'up',
    icon: <Users className="h-4 w-4" />
  },
  {
    title: 'Conversões',
    value: '89',
    change: '+8%',
    trend: 'up',
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    title: 'Reuniões Agendadas',
    value: '156',
    change: '-3%',
    trend: 'down',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    title: 'Taxa de Conversão',
    value: '36%',
    change: '+2%',
    trend: 'up',
    icon: <BarChart3 className="h-4 w-4" />
  }
];

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up': return 'text-green-600';
    case 'down': return 'text-red-600';
    case 'stable': return 'text-gray-600';
    default: return 'text-gray-600';
  }
};

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedReport, setSelectedReport] = useState('overview');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Análise detalhada de métricas e performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de Relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Visão Geral</SelectItem>
              <SelectItem value="sales">Vendas</SelectItem>
              <SelectItem value="clients">Clientes</SelectItem>
              <SelectItem value="conversion">Conversão</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                {metric.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${getTrendColor(metric.trend)}`}>
                  {metric.change} em relação ao período anterior
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Funil de Vendas</CardTitle>
              <CardDescription>
                Acompanhe o progresso dos leads através do funil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Leads</span>
                  <Badge variant="secondary">324</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Qualificados</span>
                  <Badge variant="secondary">156</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Propostas</span>
                  <Badge variant="secondary">89</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fechados</span>
                  <Badge variant="default">47</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance por Vendedor</CardTitle>
              <CardDescription>
                Ranking de performance da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">João Silva</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">23 vendas</Badge>
                    <span className="text-green-600 text-sm">+15%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Maria Santos</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">18 vendas</Badge>
                    <span className="text-green-600 text-sm">+8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pedro Costa</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">12 vendas</Badge>
                    <span className="text-red-600 text-sm">-2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gráfico de Tendências</CardTitle>
            <CardDescription>
              Visualização temporal das métricas principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Gráfico será implementado aqui</p>
                <p className="text-sm text-muted-foreground">Integração com biblioteca de gráficos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}