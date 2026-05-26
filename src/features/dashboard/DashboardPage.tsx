import { useState } from 'react';
import { Package, Ticket, BookOpen, Wrench, TrendingUp, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAsync } from '@/hooks/useSkeleton';
import { gql, cn } from '@/lib/utils';
import { TICKET_STATUS_CONFIG } from '@/lib/constants';
import type { DashboardStats, TicketStatus } from '@/lib/types';
import { LuxPieChart } from '@/components/charts/PieChart';
import { LuxBarChart } from '@/components/charts/BarChart';
import { CardSkeleton, ChartSkeleton } from '@/components/skeletons/CardSkeleton';
import { Button } from '@/components/ui/button';

const DASHBOARD_QUERY = `
 query GetDashboardStats($period: String) {
 dashboardStats(period: $period) {
 totalEquipment
 openTickets
 activeLoans
 pendingServices
 ticketsByStatus { status count }
 servicesByPeriod { date count }
 }
 }
`;

const TICKET_COLORS: Record<TicketStatus, string> = {
 pending: 'rgb(255,159,10)',
 in_progress: 'rgb(0,122,255)',
 in_resolution: 'rgb(255,159,10)',
 resolved: 'rgb(52,199,89)',
};

interface MetricCardProps {
 icon: React.ElementType;
 label: string;
 value: number | string;
 color: string;
}

function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
 return (
 <div
 className="rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:border-primary/20 hover:bg-card/75 hover:shadow-md hover:-translate-y-[2px]" >
 <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4" style={{ backgroundColor: `${color}12` }}>
 <Icon className="h-5 w-5" style={{ color }} />
 </div>
 <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">{label}</p>
 <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
 </div>
 );
}

export function DashboardPage() {
 const { user, hasRole } = useAuth();
 const [period] = useState('7d');
 const { data, isLoading, error } = useAsync<{ dashboardStats: DashboardStats }>(
 () => gql(DASHBOARD_QUERY, { period }),
 [period]
 );

 const stats = data?.dashboardStats;

 const pieData = stats?.ticketsByStatus.map(t => ({
 name: TICKET_STATUS_CONFIG[t.status as TicketStatus].label,
 value: t.count,
 color: TICKET_COLORS[t.status as TicketStatus],
 })) ?? [];

 const barData = stats?.servicesByPeriod.map(s => ({
 label: s.date.slice(5),
 value: s.count,
 })) ?? [];

 // Show full skeletons ONLY on first load (when we don't have stats yet)
 const isInitialLoading = isLoading && !stats;

 return (
 <div className="space-y-8 max-w-full">
 <div className="flex items-end justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-foreground">
 Buenos días, {user?.name.split(' ')[0]}
 </h1>
 <p className="text-sm text-muted-foreground mt-0.5">
 Resumen del sistema · ITI CETP
 </p>
 </div>
 {hasRole('root_admin', 'admin') && (
 <div className="flex gap-2">
 <Button variant="secondary" size="sm">
 <Download className="h-3.5 w-3.5" />
 Exportar CSV
 </Button>
 </div>
 )}
 </div>

 {isInitialLoading ? (
 <CardSkeleton count={4} />
 ) : error ? (
 <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
 Error al cargar estadísticas: {error}
 </div>
 ) : (
 <div className={cn(
"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300 ease-out",
 isLoading &&"opacity-75 blur-xs pointer-events-none" )}>
 <MetricCard icon={Package} label="Equipos totales" value={stats?.totalEquipment ?? 0} color="rgb(0,122,255)" />
 <MetricCard icon={Ticket} label="Tickets abiertos" value={stats?.openTickets ?? 0} color="rgb(255,159,10)" />
 <MetricCard icon={BookOpen} label="Préstamos activos" value={stats?.activeLoans ?? 0} color="rgb(52,199,89)" />
 <MetricCard icon={Wrench} label="Solicitudes pendientes" value={stats?.pendingServices ?? 0} color="rgb(255,69,58)" />
 </div>
 )}

 {isInitialLoading ? (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <ChartSkeleton />
 <ChartSkeleton />
 </div>
 ) : !error && pieData.length > 0 && (
 <div className={cn(
"grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-300 ease-out",
 isLoading &&"opacity-75 blur-xs pointer-events-none" )}>
 <LuxPieChart
 data={pieData}
 title="Tickets por estado" />
 <LuxBarChart
 data={barData}
 title="Solicitudes de servicio — últimos 7 días" color="rgb(0,122,255)" />
 </div>
 )}

 {!isInitialLoading && !error && stats && (
 <div
 className={cn(
"rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 ease-out",
 isLoading &&"opacity-75 blur-xs pointer-events-none" )}
 >
 <div className="flex items-center gap-2 mb-4">
 <TrendingUp className="h-4 w-4 text-primary" />
 <p className="text-sm font-semibold text-foreground">Estado del sistema</p>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 {pieData.map(item => (
 <div key={item.name} className="space-y-1.5">
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">{item.name}</span>
 <span className="text-xs font-semibold text-foreground">{item.value}</span>
 </div>
 <div className="h-1.5 rounded-full bg-muted overflow-hidden">
 <div
 className="h-full rounded-full transition-all duration-500" style={{
 width: `${Math.min((item.value / Math.max(stats?.openTickets ?? 1, 1)) * 100, 100)}%`,
 backgroundColor: item.color,
 }}
 />
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}
