import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

type AdPlatform = { id: string; name: string; external_id: string | null };
type AdCampaign = { id: string; name: string | null; campaign_external_id: string | null; platform_id: string | null };

const AdsManager: React.FC = () => {
  const [platforms, setPlatforms] = React.useState<AdPlatform[]>([]);
  const [campaigns, setCampaigns] = React.useState<AdCampaign[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Platform form state
  const [platformName, setPlatformName] = React.useState("");
  const [platformExternal, setPlatformExternal] = React.useState("");

  // Campaign form state
  const [campaignName, setCampaignName] = React.useState("");
  const [campaignExternal, setCampaignExternal] = React.useState("");
  const [campaignPlatformId, setCampaignPlatformId] = React.useState<string>("");

  // Daily metrics quick import
  const [metricDate, setMetricDate] = React.useState<string>("");
  const [metricPlatform, setMetricPlatform] = React.useState<string>("facebook");
  const [metricCampaignId, setMetricCampaignId] = React.useState<string>("");
  const [metricImpressions, setMetricImpressions] = React.useState<number>(0);
  const [metricClicks, setMetricClicks] = React.useState<number>(0);
  const [metricCost, setMetricCost] = React.useState<number>(0);
  const [metricLeads, setMetricLeads] = React.useState<number>(0);
  const [metricRevenue, setMetricRevenue] = React.useState<number>(0);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("ad_platforms").select("id,name,external_id").eq("user_id", user.id).order("name", { ascending: true }),
        supabase.from("ad_campaigns").select("id,name,campaign_external_id,platform_id").eq("user_id", user.id).order("created_at", { ascending: false })
      ]);
      setPlatforms((p || []) as any);
      setCampaigns((c || []) as any);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleAddPlatform = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !platformName.trim()) return;
    await supabase.from("ad_platforms").insert({ user_id: user.id, name: platformName.trim(), external_id: platformExternal.trim() || null });
    setPlatformName("");
    setPlatformExternal("");
    await loadData();
  };

  const handleDeletePlatform = async (id: string) => {
    await supabase.from("ad_platforms").delete().eq("id", id);
    await loadData();
  };

  const handleAddCampaign = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !campaignName.trim()) return;
    await supabase.from("ad_campaigns").insert({
      user_id: user.id,
      name: campaignName.trim(),
      campaign_external_id: campaignExternal.trim() || null,
      platform_id: campaignPlatformId || null,
    });
    setCampaignName("");
    setCampaignExternal("");
    setCampaignPlatformId("");
    await loadData();
  };

  const handleDeleteCampaign = async (id: string) => {
    await supabase.from("ad_campaigns").delete().eq("id", id);
    await loadData();
  };

  const handleInsertDailyMetric = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !metricDate) return;
    await supabase.from("ad_daily_metrics").insert({
      user_id: user.id,
      date: metricDate,
      platform: metricPlatform,
      campaign_id: metricCampaignId || null,
      impressions: metricImpressions,
      clicks: metricClicks,
      cost: metricCost,
      leads: metricLeads,
      revenue: metricRevenue || null,
    });
    setMetricImpressions(0);
    setMetricClicks(0);
    setMetricCost(0);
    setMetricLeads(0);
    setMetricRevenue(0);
  };

  return (
    <div className="h-full bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-auto">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 pb-16 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Gestão de Anúncios</h1>
          <p className="text-sm text-muted-foreground">Cadastre plataformas e campanhas, e insira métricas diárias para alimentar as análises da seção de Métricas &gt; Anúncios.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Plataformas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Nome</Label>
                  <Input placeholder="facebook / google / instagram" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                </div>
                <div>
                  <Label>ID Externo (opcional)</Label>
                  <Input placeholder="ID na plataforma" value={platformExternal} onChange={(e) => setPlatformExternal(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button className="w-full" onClick={handleAddPlatform} disabled={!platformName.trim() || loading}>Adicionar</Button>
                </div>
              </div>

              <div className="border rounded-md divide-y">
                {platforms.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">Nenhuma plataforma cadastrada.</div>
                ) : (
                  platforms.map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">ext: {p.external_id || "—"}</div>
                      </div>
                      <Button variant="destructive" onClick={() => handleDeletePlatform(p.id)}>Remover</Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campanhas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <Label>Nome</Label>
                  <Input placeholder="Nome da campanha" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
                </div>
                <div>
                  <Label>ID Externo (opcional)</Label>
                  <Input placeholder="ID na plataforma" value={campaignExternal} onChange={(e) => setCampaignExternal(e.target.value)} />
                </div>
                <div>
                  <Label>Plataforma</Label>
                  <Select value={campaignPlatformId} onValueChange={setCampaignPlatformId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full" onClick={handleAddCampaign} disabled={!campaignName.trim() || loading}>Adicionar</Button>
                </div>
              </div>

              <div className="border rounded-md divide-y">
                {campaigns.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">Nenhuma campanha cadastrada.</div>
                ) : (
                  campaigns.map((c) => (
                    <div key={c.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{c.name || "Sem nome"}</div>
                        <div className="text-xs text-muted-foreground">ext: {c.campaign_external_id || "—"}</div>
                      </div>
                      <Button variant="destructive" onClick={() => handleDeleteCampaign(c.id)}>Remover</Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Importação Rápida de Métricas Diárias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <div>
                <Label>Data</Label>
                <Input type="date" value={metricDate} onChange={(e) => setMetricDate(e.target.value)} />
              </div>
              <div>
                <Label>Plataforma</Label>
                <Select value={metricPlatform} onValueChange={setMetricPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="other">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Campanha (opcional)</Label>
                <Select value={metricCampaignId} onValueChange={setMetricCampaignId}>
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name || c.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Impressões</Label>
                <Input type="number" value={metricImpressions} onChange={(e) => setMetricImpressions(Number(e.target.value || 0))} />
              </div>
              <div>
                <Label>Cliques</Label>
                <Input type="number" value={metricClicks} onChange={(e) => setMetricClicks(Number(e.target.value || 0))} />
              </div>
              <div>
                <Label>Custo (R$)</Label>
                <Input type="number" step="0.01" value={metricCost} onChange={(e) => setMetricCost(Number(e.target.value || 0))} />
              </div>
              <div>
                <Label>Leads</Label>
                <Input type="number" value={metricLeads} onChange={(e) => setMetricLeads(Number(e.target.value || 0))} />
              </div>
              <div>
                <Label>Receita (R$)</Label>
                <Input type="number" step="0.01" value={metricRevenue} onChange={(e) => setMetricRevenue(Number(e.target.value || 0))} />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={handleInsertDailyMetric} disabled={!metricDate}>Salvar Métrica</Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Dica: após alguns dias de dados, as tendências serão calculadas sem mocks, comparando janelas (ex.: últimos 7 dias vs 7 dias anteriores).</p>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default AdsManager;


