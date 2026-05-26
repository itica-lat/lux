import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Ticket, BookOpen, Wrench, TrendingUp, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAsync } from '@/hooks/useSkeleton';
import { gql } from '@/lib/utils';
import { TICKET_STATUS_CONFIG, SPRING_TRANSITION } from '@/lib/constants';
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
  delay: number;
}

function MetricCard({ icon: Icon, label, value, color, delay }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING_TRANSITION, delay }}
      className="rounded-2xl border border-black/8 dark:border-white/5 bg-white/40 dark:bg-[#0a0a0c]/40 backdrop-blur-xl p-6"
    >
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4`} style={{ backgroundColor: `${color}15` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="text-xs text-[#86868b] uppercase tracking-widest font-medium mb-1">{label}</p>
      <p className="text-3xl font-medium tracking-tight text-[#1d1d1f] dark:text-white">{value}</p>
    </motion.div>
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

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-white">
            Buenos días, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-[#86868b] mt-0.5">
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

      {isLoading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <div className="rounded-2xl border border-[rgba(255,69,58,0.2)] bg-[rgba(255,69,58,0.06)] p-4 text-sm text-[rgb(255,69,58)]">
          Error al cargar estadísticas: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Package} label="Equipos totales" value={stats?.totalEquipment ?? 0} color="rgb(0,122,255)" delay={0} />
          <MetricCard icon={Ticket} label="Tickets abiertos" value={stats?.openTickets ?? 0} color="rgb(255,159,10)" delay={0.05} />
          <MetricCard icon={BookOpen} label="Préstamos activos" value={stats?.activeLoans ?? 0} color="rgb(52,199,89)" delay={0.1} />
          <MetricCard icon={Wrench} label="Solicitudes pendientes" value={stats?.pendingServices ?? 0} color="rgb(255,69,58)" delay={0.15} />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : !error && pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LuxPieChart
            data={pieData}
            title="Tickets por estado"
          />
          <LuxBarChart
            data={barData}
            title="Solicitudes de servicio — últimos 7 días"
            color="rgb(0,122,255)"
          />
        </div>
      )}

      {!isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_TRANSITION, delay: 0.3 }}
          className="rounded-2xl border border-black/8 dark:border-white/5 bg-white/40 dark:bg-[#0a0a0c]/40 backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[rgb(0,122,255)]" />
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Estado del sistema</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {pieData.map(item => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#86868b]">{item.name}</span>
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((item.value / Math.max(stats?.openTickets ?? 1, 1)) * 100, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
