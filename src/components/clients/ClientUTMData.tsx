import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Users, Target, Activity } from "lucide-react";
import StatCard from "../metrics/StatCard";

interface UTMData {
  id: string;
  lead_id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  utm_created_at: string;
  utm_conversion: boolean;
  utm_conversion_value: number;
  utm_conversion_stage: string;
  landing_page: string;
  device_type: string;
  geo_location: any;
  utm_first_touch: string;
  utm_last_touch: string;
}

interface UTMMetrics {
  totalInteractions: number;
  totalCampaigns: number;
  conversionRate: number;
  topSources: Array<{ source: string; count: number }>;
  topCampaigns: Array<{ campaign: string; count: number }>;
}

interface ClientUTMDataProps {
  contactId: string;
}

const ClientUTMData: React.FC<ClientUTMDataProps> = ({ contactId }) => {
  const [utmData, setUtmData] = useState<UTMData[]>([]);
  const [metrics, setMetrics] = useState<UTMMetrics>({
    totalInteractions: 0,
    totalCampaigns: 0,
    conversionRate: 0,
    topSources: [],
    topCampaigns: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resumo");

  useEffect(() => {
    const fetchUTMData = async () => {
      try {
        setLoading(true);

        // Buscar dados UTM relacionados ao cliente
        const { data, error } = await supabase
          .from("utm_tracking")
          .select("*")
          .eq("lead_id", contactId)
          .order("utm_created_at", { ascending: false });

        if (error) {
          console.error("Erro ao buscar dados UTM:", error);
          return;
        }

        setUtmData(data || []);

        // Calcular métricas
        if (data && data.length > 0) {
          const totalInteractions = data.length;
          const totalCampaigns = new Set(
            data.map((item) => item.utm_campaign).filter(Boolean),
          ).size;
          const conversions = data.filter((item) => item.utm_conversion).length;
          const conversionRate =
            totalInteractions > 0 ? (conversions / totalInteractions) * 100 : 0;

          // Calcular top sources
          const sourcesMap = data.reduce(
            (acc: Record<string, number>, item) => {
              if (item.utm_source) {
                acc[item.utm_source] = (acc[item.utm_source] || 0) + 1;
              }
              return acc;
            },
            {},
          );

          const topSources = Object.entries(sourcesMap)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          // Calcular top campaigns
          const campaignsMap = data.reduce(
            (acc: Record<string, number>, item) => {
              if (item.utm_campaign) {
                acc[item.utm_campaign] = (acc[item.utm_campaign] || 0) + 1;
              }
              return acc;
            },
            {},
          );

          const topCampaigns = Object.entries(campaignsMap)
            .map(([campaign, count]) => ({ campaign, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          setMetrics({
            totalInteractions,
            totalCampaigns,
            conversionRate,
            topSources,
            topCampaigns,
          });
        }
      } catch (error) {
        console.error("Erro ao processar dados UTM:", error);
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchUTMData();
    }
  }, [contactId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 h-10 mb-4">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4">
          {utmData.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  Nenhum dado UTM encontrado para este cliente.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Interações"
                  value={metrics.totalInteractions.toString()}
                  icon={<Activity className="h-4 w-4 text-blue-600" />}
                />
                <StatCard
                  title="Campanhas"
                  value={metrics.totalCampaigns.toString()}
                  icon={<Share2 className="h-4 w-4 text-purple-600" />}
                />
                <StatCard
                  title="Taxa de Conversão"
                  value={`${metrics.conversionRate.toFixed(1)}%`}
                  icon={<Target className="h-4 w-4 text-green-600" />}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Principais Fontes
                    </CardTitle>
                    <CardDescription>
                      De onde vieram as interações
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics.topSources.length > 0 ? (
                      <div className="space-y-2">
                        {metrics.topSources.map((source, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-600"
                            >
                              {source.source}
                            </Badge>
                            <span className="text-sm font-medium">
                              {source.count} interações
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Nenhuma fonte encontrada
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Principais Campanhas
                    </CardTitle>
                    <CardDescription>Campanhas mais utilizadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics.topCampaigns.length > 0 ? (
                      <div className="space-y-2">
                        {metrics.topCampaigns.map((campaign, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-600"
                            >
                              {campaign.campaign}
                            </Badge>
                            <span className="text-sm font-medium">
                              {campaign.count} interações
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Nenhuma campanha encontrada
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de UTM</CardTitle>
              <CardDescription>
                Parâmetros UTM para este cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UTM Source</TableHead>
                    <TableHead>UTM Medium</TableHead>
                    <TableHead>UTM Campaign</TableHead>
                    <TableHead>UTM Content</TableHead>
                    <TableHead>UTM Term</TableHead>
                    <TableHead>Nome Amigável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {utmData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        Nenhuma configuração UTM encontrada para este cliente
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Agrupar UTMs únicas para mostrar como configurações
                    Array.from(
                      new Set(
                        utmData.map(
                          (item) =>
                            `${item.utm_source}-${item.utm_medium}-${item.utm_campaign}-${item.utm_content}-${item.utm_term}`,
                        ),
                      ),
                    ).map((uniqueKey, index) => {
                      // Encontrar o primeiro item com esta combinação única
                      const item = utmData.find(
                        (data) =>
                          `${data.utm_source}-${data.utm_medium}-${data.utm_campaign}-${data.utm_content}-${data.utm_term}` ===
                          uniqueKey,
                      );

                      if (!item) return null;

                      // Nome amigável é uma combinação de source e campaign
                      const friendlyName = `${item.utm_source || "Direto"} - ${
                        item.utm_campaign || "Sem campanha"
                      }`;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-600"
                            >
                              {item.utm_source || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-600"
                            >
                              {item.utm_medium || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-600"
                            >
                              {item.utm_campaign || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-orange-50 text-orange-600"
                            >
                              {item.utm_content || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-pink-50 text-pink-600"
                            >
                              {item.utm_term || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-600"
                            >
                              {friendlyName}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientUTMData;
