import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, DollarSign, MousePointer, Users, BarChart3 } from "lucide-react";
import MetricCard from "./MetricCard";
import { supabase } from "@/integrations/supabase/client";

interface AdManagerSectionProps {
	loading?: boolean;
	startDate?: string; // ISO
	endDate?: string; // ISO
}

const AdManagerSection: React.FC<AdManagerSectionProps> = ({ loading = false, startDate, endDate }) => {
	const [selectedPlatform, setSelectedPlatform] = useState("all");
	const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
	const [daily, setDaily] = useState<Array<{ date: string; cost: number; leads: number; platform: string; campaignId?: string | null }>>([]);
	const [bySource, setBySource] = useState<Array<{ name: string; value: number; color: string }>>([]);
	const [kpis, setKpis] = useState<{ investment: number; ctr: number; cpc: number; cpl: number; leads: number; roas: number } | null>(null);
	const [prevKpis, setPrevKpis] = useState<{ investment: number; ctr: number; cpc: number; cpl: number; leads: number; roas: number } | null>(null);
	const [campaignOptions, setCampaignOptions] = useState<Array<{ id: string; name: string }>>([]);

	const platformOptions = [
		{ label: "Todas as Plataformas", value: "all" },
		{ label: "Facebook Ads", value: "facebook" },
		{ label: "Google Ads", value: "google" },
		{ label: "Instagram Ads", value: "instagram" },
	];

	React.useEffect(() => {
		(async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			// Intervalo do filtro
			const end = endDate ? new Date(endDate) : new Date();
			const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 3600 * 1000);
			const startStr = start.toISOString().slice(0,10);
			const endStr = end.toISOString().slice(0,10);

			// Daily metrics
			const { data: rows } = await supabase
				.from('ad_daily_metrics')
				.select('date, platform, campaign_id, cost, leads, clicks, impressions, revenue')
				.eq('user_id', user.id)
				.gte('date', startStr)
				.lte('date', endStr);

			const metrics = (rows || []).map(r => ({
				date: new Date((r as any).date).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }),
				platform: ((r as any).platform as string) || 'other',
				campaignId: (r as any).campaign_id as string | null,
				cost: Number((r as any).cost || 0),
				leads: Number((r as any).leads || 0),
				clicks: Number((r as any).clicks || 0),
				impressions: Number((r as any).impressions || 0),
				revenue: Number((r as any).revenue || 0),
			}));
			setDaily(metrics);

			// Campanhas disponíveis
			const { data: camp } = await supabase
				.from('ad_campaigns')
				.select('id,name')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false });
			setCampaignOptions((camp || []).map((c: any) => ({ id: c.id, name: c.name || c.id })));

			// Aplicar filtros de plataforma/campanha
			const filtered = metrics.filter(m => (selectedPlatform === 'all' || m.platform === selectedPlatform) && (selectedCampaign === 'all' || m.campaignId === selectedCampaign));

			// KPIs agregados filtrados
			const investment = filtered.reduce((s,m)=> s + m.cost, 0);
			const totalClicks = filtered.reduce((s,m)=> s + (m.clicks || 0), 0);
			const totalImpressions = filtered.reduce((s,m)=> s + (m.impressions || 0), 0);
			const leads = filtered.reduce((s,m)=> s + (m.leads || 0), 0);
			const revenue = filtered.reduce((s,m)=> s + (m.revenue || 0), 0);
			const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
			const cpc = totalClicks > 0 ? investment / totalClicks : 0;
			const cpl = leads > 0 ? investment / leads : 0;
			const roas = investment > 0 ? (revenue / investment) : 0;
			setKpis({ investment, ctr, cpc, cpl, leads, roas });

			// Período anterior (mesmo tamanho)
			const prevEnd = new Date(start.getTime() - 24 * 3600 * 1000);
			const prevStart = new Date(prevEnd.getTime() - 7 * 24 * 3600 * 1000);
			const prevStartStr = prevStart.toISOString().slice(0,10);
			const prevEndStr = prevEnd.toISOString().slice(0,10);

			const { data: prevRows } = await supabase
				.from('ad_daily_metrics')
				.select('date, platform, campaign_id, cost, leads, clicks, impressions, revenue')
				.eq('user_id', user.id)
				.gte('date', prevStartStr)
				.lte('date', prevEndStr);
			const prevMetrics = (prevRows || []).map(r => ({
				platform: ((r as any).platform as string) || 'other',
				campaignId: (r as any).campaign_id as string | null,
				cost: Number((r as any).cost || 0),
				leads: Number((r as any).leads || 0),
				clicks: Number((r as any).clicks || 0),
				impressions: Number((r as any).impressions || 0),
				revenue: Number((r as any).revenue || 0),
			}));
			const prevFiltered = prevMetrics.filter(m => (selectedPlatform === 'all' || m.platform === selectedPlatform) && (selectedCampaign === 'all' || m.campaignId === selectedCampaign));
			const pInvestment = prevFiltered.reduce((s,m)=> s + m.cost, 0);
			const pClicks = prevFiltered.reduce((s,m)=> s + (m.clicks || 0), 0);
			const pImpr = prevFiltered.reduce((s,m)=> s + (m.impressions || 0), 0);
			const pLeads = prevFiltered.reduce((s,m)=> s + (m.leads || 0), 0);
			const pRevenue = prevFiltered.reduce((s,m)=> s + (m.revenue || 0), 0);
			const pCtr = pImpr > 0 ? (pClicks / pImpr) * 100 : 0;
			const pCpc = pClicks > 0 ? pInvestment / pClicks : 0;
			const pCpl = pLeads > 0 ? pInvestment / pLeads : 0;
			const pRoas = pInvestment > 0 ? (pRevenue / pInvestment) : 0;
			setPrevKpis({ investment: pInvestment, ctr: pCtr, cpc: pCpc, cpl: pCpl, leads: pLeads, roas: pRoas });

			// Leads por fonte (pie) usando utm_tracking no mesmo período
			const { data: utm } = await supabase
				.from('utm_tracking')
				.select('utm_source')
				.eq('user_id', user.id)
				.gte('created_at', start.toISOString())
				.lte('created_at', end.toISOString());
			const counts: Record<string, number> = {};
			(utm || []).forEach(r => {
				const src = (r as any).utm_source || 'Outros';
				counts[src] = (counts[src] || 0) + 1;
			});
			const colorMap: Record<string,string> = { Facebook: '#1877F2', Google: '#4285F4', Instagram: '#E4405F', Outros: '#64748B' };
			const pie = Object.entries(counts).map(([name,value])=>({ name, value, color: colorMap[name] || '#64748B' }));
			setBySource(pie);
		})();
	}, [startDate, endDate, selectedPlatform, selectedCampaign]);

	const investmentData = useMemo(() => {
		const grouped: Record<string, Record<string, number>> = {};
		const source = daily.filter(m => (selectedPlatform === 'all' || m.platform === selectedPlatform) && (selectedCampaign === 'all' || m.campaignId === selectedCampaign));
		source.forEach(m => {
			if (!grouped[m.date]) grouped[m.date] = {};
			grouped[m.date][m.platform] = (grouped[m.date][m.platform] || 0) + m.cost;
		});
		return Object.entries(grouped).map(([date, vals]) => ({
			date,
			facebook: vals['facebook'] || 0,
			google: vals['google'] || 0,
			instagram: vals['instagram'] || 0,
		}));
	}, [daily, selectedPlatform, selectedCampaign]);

	const CustomTooltip = ({ active, payload, label }: any) => {
		if ((active as any) && (payload as any) && (payload as any).length) {
			return (
				<div className="bg-background border border-border rounded-lg shadow-lg p-3">
					<p className="font-medium">{label as any}</p>
					{(payload as any).map((entry: any) => (
						<p key={String(entry.name)} style={{ color: entry.color }} className="text-sm">
							{entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
						</p>
					))}
				</div>
			);
		}
		return null;
	};

	const buildTrend = (current: number, previous: number) => {
		if (previous === 0) {
			return { value: 0, label: '— vs período anterior', direction: 'neutral' as const };
		}
		const diff = ((current - previous) / previous) * 100;
		return {
			value: diff,
			label: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}% vs período anterior`,
			direction: diff > 0 ? ('up' as const) : diff < 0 ? ('down' as const) : ('neutral' as const)
		};
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
							<Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
								<SelectTrigger className="w-56">
									<SelectValue placeholder="Todas as campanhas" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todas as campanhas</SelectItem>
									{campaignOptions.map((c) => (
										<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
							value={`R$ ${(kpis?.investment || 0).toLocaleString('pt-BR')}`}
							icon={<DollarSign />}
							description="Total investido em anúncios no período selecionado"
							trend={prevKpis ? buildTrend(kpis?.investment || 0, prevKpis.investment) : undefined}
							iconBgClass="bg-green-100 dark:bg-green-900/30"
							iconTextClass="text-green-600 dark:text-green-400"
							loading={loading}
						/>

						<MetricCard
							title="CTR"
							value={`${(kpis?.ctr || 0).toFixed(2)}%`}
							icon={<MousePointer />}
							description="Taxa de cliques - percentual de pessoas que clicaram no anúncio"
							trend={prevKpis ? buildTrend(kpis?.ctr || 0, prevKpis.ctr) : undefined}
							iconBgClass="bg-blue-100 dark:bg-blue-900/30"
							iconTextClass="text-blue-600 dark:text-blue-400"
							loading={loading}
						/>

						<MetricCard
							title="CPC"
							value={`R$ ${(kpis?.cpc || 0).toFixed(2)}`}
							icon={<Target />}
							description="Custo por clique - valor médio pago por cada clique"
							trend={prevKpis ? buildTrend(kpis?.cpc || 0, prevKpis.cpc) : undefined}
							iconBgClass="bg-orange-100 dark:bg-orange-900/30"
							iconTextClass="text-orange-600 dark:text-orange-400"
							loading={loading}
						/>

						<MetricCard
							title="CPL"
							value={`R$ ${(kpis?.cpl || 0).toFixed(2)}`}
							icon={<Users />}
							description="Custo por lead - valor médio investido para gerar um lead"
							trend={prevKpis ? buildTrend(kpis?.cpl || 0, prevKpis.cpl) : undefined}
							iconBgClass="bg-purple-100 dark:bg-purple-900/30"
							iconTextClass="text-purple-600 dark:text-purple-400"
							loading={loading}
						/>

						<MetricCard
							title="Leads"
							value={kpis?.leads || 0}
							icon={<Users />}
							description="Total de leads gerados através dos anúncios"
							trend={prevKpis ? buildTrend(kpis?.leads || 0, prevKpis.leads) : undefined}
							iconBgClass="bg-emerald-100 dark:bg-emerald-900/30"
							iconTextClass="text-emerald-600 dark:text-emerald-400"
							loading={loading}
						/>

						<MetricCard
							title="ROAS"
							value={`${(kpis?.roas || 0).toFixed(1)}x`}
							icon={<TrendingUp />}
							description="Retorno sobre investimento em anúncios"
							trend={prevKpis ? buildTrend(kpis?.roas || 0, prevKpis.roas) : undefined}
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
											data={bySource}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{bySource.map((entry) => (
												<Cell key={`cell-${entry.name}`} fill={entry.color} />
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