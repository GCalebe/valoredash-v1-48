import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  DollarSign,
  Users,
  Calendar,
  Brain,
  MessageSquare,
  ShoppingCart,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NjI4NzEsImV4cCI6MjA1MTMzODg3MX0.4_5SzlQOCjKJWJhEhJhvQJQX5Y8X5Y8X5Y8X5Y8X5Y8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos TypeScript
interface TableStats {
  tablename: string;
  current_rows: number;
  total_inserts: number;
  total_updates: number;
  total_deletes: number;
  last_vacuum: string;
  vacuum_count: number;
}

interface SystemAnalysis {
  name: string;
  totalTables: number;
  activeTables: number;
  coverage: number;
  totalRows: number;
  utilizationRate: number;
  roiPotential: number;
  icon: React.ReactNode;
  color: string;
}

interface Recommendation {
  system: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  issue: string;
  recommendation: string;
  roiPotential: number;
  impact: string;
}

// Configuração dos sistemas
const SYSTEM_CONFIG = {
  scheduling: { icon: <Calendar className="h-4 w-4" />, color: '#3b82f6', name: 'Agendamento' },
  ai: { icon: <Brain className="h-4 w-4" />, color: '#8b5cf6', name: 'Inteligência Artificial' },
  knowledge: { icon: <Database className="h-4 w-4" />, color: '#10b981', name: 'Base de Conhecimento' },
  conversations: { icon: <MessageSquare className="h-4 w-4" />, color: '#f59e0b', name: 'Conversas' },
  analytics: { icon: <BarChart3 className="h-4 w-4" />, color: '#ef4444', name: 'Analytics' },
  campaigns: { icon: <TrendingUp className="h-4 w-4" />, color: '#06b6d4', name: 'Campanhas' },
  products: { icon: <ShoppingCart className="h-4 w-4" />, color: '#84cc16', name: 'Produtos' },
  employees: { icon: <Users className="h-4 w-4" />, color: '#f97316', name: 'Funcionários' },
  payments: { icon: <DollarSign className="h-4 w-4" />, color: '#22c55e', name: 'Pagamentos' },
  calendar: { icon: <Calendar className="h-4 w-4" />, color: '#a855f7', name: 'Calendário' },
  configuration: { icon: <Settings className="h-4 w-4" />, color: '#6b7280', name: 'Configuração' },
  users: { icon: <Users className="h-4 w-4" />, color: '#ec4899', name: 'Usuários' },
  core: { icon: <Database className="h-4 w-4" />, color: '#1f2937', name: 'Core' }
};

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#22c55e', '#a855f7', '#6b7280', '#ec4899', '#1f2937'];

const TableUtilizationDashboard: React.FC = () => {
  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [systemAnalysis, setSystemAnalysis] = useState<SystemAnalysis[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [totalROI, setTotalROI] = useState(0);

  // Função para executar SQL
  const executeSQL = async (query: string) => {
    try {
      const { data, error } = await supabase.rpc('execute_sql', { query });
      if (error) {
        console.error('SQL Error:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Execute SQL Error:', err);
      return null;
    }
  };

  // Carregar dados das tabelas
  const loadTableStats = async () => {
    const query = `
      SELECT 
        tablename,
        n_live_tup as current_rows,
        n_tup_ins as total_inserts,
        n_tup_upd as total_updates,
        n_tup_del as total_deletes,
        last_vacuum,
        vacuum_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC;
    `;
    
    const stats = await executeSQL(query);
    if (stats) {
      setTableStats(stats);
      generateSystemAnalysis(stats);
      generateRecommendations(stats);
    }
  };

  // Gerar análise por sistema
  const generateSystemAnalysis = (stats: TableStats[]) => {
    const systems = Object.entries(SYSTEM_CONFIG).map(([key, config]) => {
      const systemTables = getTablesForSystem(key);
      const systemStats = stats.filter(stat => systemTables.includes(stat.tablename));
      
      const totalRows = systemStats.reduce((sum, table) => sum + (table.current_rows || 0), 0);
      const totalActivity = systemStats.reduce((sum, table) => 
        sum + (table.total_inserts || 0) + (table.total_updates || 0), 0
      );
      
      const utilizationRate = systemStats.length > 0 ? 
        (systemStats.filter(t => (t.current_rows || 0) > 0).length / systemStats.length) * 100 : 0;
      
      const roiPotential = calculateROIPotential(key, totalRows);
      
      return {
        name: config.name,
        totalTables: systemTables.length,
        activeTables: systemStats.length,
        coverage: systemStats.length > 0 ? (systemStats.length / systemTables.length) * 100 : 0,
        totalRows,
        utilizationRate,
        roiPotential,
        icon: config.icon,
        color: config.color
      };
    });
    
    setSystemAnalysis(systems);
    setTotalROI(systems.reduce((sum, system) => sum + system.roiPotential, 0));
  };

  // Gerar recomendações
  const generateRecommendations = (stats: TableStats[]) => {
    const recs: Recommendation[] = [];
    
    Object.entries(SYSTEM_CONFIG).forEach(([key, config]) => {
      const systemTables = getTablesForSystem(key);
      const systemStats = stats.filter(stat => systemTables.includes(stat.tablename));
      
      const utilizationRate = systemStats.length > 0 ? 
        (systemStats.filter(t => (t.current_rows || 0) > 0).length / systemStats.length) * 100 : 0;
      
      const roiPotential = calculateROIPotential(key, 
        systemStats.reduce((sum, table) => sum + (table.current_rows || 0), 0)
      );
      
      if (utilizationRate < 50 && roiPotential > 5000) {
        recs.push({
          system: config.name,
          priority: roiPotential > 30000 ? 'CRITICAL' : roiPotential > 15000 ? 'HIGH' : 'MEDIUM',
          issue: `Sistema com ${utilizationRate.toFixed(1)}% de utilização`,
          recommendation: `Ativar funcionalidades do sistema ${config.name}`,
          roiPotential,
          impact: roiPotential > 30000 ? 'Alto Impacto' : roiPotential > 15000 ? 'Médio Impacto' : 'Baixo Impacto'
        });
      }
    });
    
    setRecommendations(recs.sort((a, b) => b.roiPotential - a.roiPotential));
  };

  // Obter tabelas por sistema (simplificado)
  const getTablesForSystem = (system: string): string[] => {
    const systemTables: { [key: string]: string[] } = {
      scheduling: ['agendas', 'agenda_bookings', 'agenda_recurring_bookings', 'agenda_booking_history', 'agenda_operating_hours', 'agenda_available_dates', 'agenda_reminders'],
      ai: ['ai_personalities', 'ai_personality_settings', 'ai_products', 'ai_stages'],
      knowledge: ['knowledge_base', 'knowledge_categories', 'knowledge_analytics', 'knowledge_tags', 'knowledge_article_tags', 'knowledge_comments', 'knowledge_ratings', 'faq_items'],
      conversations: ['conversations', 'conversation_metrics', 'contacts_backup', 'contact_stage_history', 'contact_stage_history_backup', 'stage_name_mapping', 'n8n_chat_messages', 'kanban_stages'],
      analytics: ['client_stats', 'conversation_daily_data', 'conversion_by_time', 'conversion_funnel_view', 'dashboard_metrics', 'funnel_data', 'monthly_growth', 'utm_metrics'],
      campaigns: ['utm_tracking', 'campaign_data', 'campaign_recipients', 'campaigns', 'leads_by_source', 'leads_over_time'],
      products: ['products', 'product_combo_items', 'product_combos', 'pricing_plans', 'invoices', 'invoice_items'],
      employees: ['employees', 'employee_agendas', 'employee_services'],
      payments: ['payment_history', 'payment_methods', 'discount_coupons', 'coupon_redemptions'],
      calendar: ['calendar_events', 'calendar_attendees', 'appointments'],
      configuration: ['custom_fields', 'custom_field_validation_rules', 'custom_field_audit_log', 'client_custom_values', 'email_templates'],
      users: ['profiles', 'user_roles', 'user_storage_usage', 'user_subscriptions', 'user_usage_metrics'],
      core: ['contacts', 'documents', 'tokens', 'imagens_drive', 'audit_log', 'test_connection']
    };
    
    return systemTables[system] || [];
  };

  // Calcular ROI potencial
  const calculateROIPotential = (system: string, totalRows: number): number => {
    const roiMap: { [key: string]: number } = {
      knowledge: 50000,
      payments: 30000,
      ai: 25000,
      analytics: 20000,
      scheduling: 15000,
      products: 12000,
      conversations: 10000,
      campaigns: 8000,
      calendar: 7000,
      employees: 5000,
      users: 4000,
      configuration: 3000,
      core: 2000
    };
    
    const baseROI = roiMap[system] || 1000;
    const utilizationMultiplier = totalRows > 0 ? 1.5 : 0.5;
    
    return Math.round(baseROI * utilizationMultiplier);
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'default';
    }
  };

  // Atualizar dados
  const refreshData = async () => {
    setLoading(true);
    await loadTableStats();
    setLastUpdate(new Date());
    setLoading(false);
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadTableStats().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados das 68 tabelas...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📊 Dashboard de Utilização - BMad Master</h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento das 68 tabelas descobertas • Última atualização: {lastUpdate.toLocaleString('pt-BR')}
          </p>
        </div>
        <Button onClick={refreshData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tabelas</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tableStats.length}</div>
            <p className="text-xs text-muted-foreground">de 68 descobertas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tableStats.reduce((sum, table) => sum + (table.current_rows || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">registros ativos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Potencial</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalROI.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">por mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">ações prioritárias</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="systems" className="space-y-4">
        <TabsList>
          <TabsTrigger value="systems">Análise por Sistema</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="tables">Tabelas Detalhadas</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        {/* Análise por Sistema */}
        <TabsContent value="systems" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemAnalysis.map((system, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {system.icon}
                    {system.name}
                  </CardTitle>
                  <Badge variant={system.utilizationRate > 50 ? 'default' : 'destructive'}>
                    {system.utilizationRate.toFixed(1)}%
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cobertura:</span>
                      <span>{system.coverage.toFixed(1)}%</span>
                    </div>
                    <Progress value={system.coverage} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Registros:</span>
                      <span>{system.totalRows.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>ROI Potencial:</span>
                      <span className="font-semibold text-green-600">
                        R$ {system.roiPotential.toLocaleString()}/mês
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Tabelas:</span>
                      <span>{system.activeTables}/{system.totalTables}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recomendações */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.map((rec, index) => (
            <Alert key={index}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                <Badge variant={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                {rec.system}
              </AlertTitle>
              <AlertDescription className="mt-2">
                <div className="space-y-1">
                  <p><strong>Problema:</strong> {rec.issue}</p>
                  <p><strong>Recomendação:</strong> {rec.recommendation}</p>
                  <p><strong>ROI Potencial:</strong> <span className="text-green-600 font-semibold">R$ {rec.roiPotential.toLocaleString()}/mês</span></p>
                  <p><strong>Impacto:</strong> {rec.impact}</p>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </TabsContent>

        {/* Tabelas Detalhadas */}
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 20 Tabelas por Registros</CardTitle>
              <CardDescription>Tabelas com maior volume de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tableStats.slice(0, 20).map((table, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{table.tablename}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{table.current_rows?.toLocaleString() || 0} registros</div>
                      <div className="text-sm text-muted-foreground">
                        {((table.total_inserts || 0) + (table.total_updates || 0)).toLocaleString()} operações
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráficos */}
        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de ROI por Sistema */}
            <Card>
              <CardHeader>
                <CardTitle>ROI Potencial por Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={systemAnalysis.sort((a, b) => b.roiPotential - a.roiPotential)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'ROI Potencial']} />
                    <Bar dataKey="roiPotential" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Utilização */}
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Utilização por Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={systemAnalysis}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, utilizationRate }) => `${name}: ${utilizationRate.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="utilizationRate"
                    >
                      {systemAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Utilização']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TableUtilizationDashboard;