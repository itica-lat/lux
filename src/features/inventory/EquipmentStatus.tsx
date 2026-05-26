import { motion } from 'motion/react';
import { useAsync } from '@/hooks/useSkeleton';
import { gql } from '@/lib/utils';
import { EQUIPMENT_STATUS_CONFIG, SPRING_TRANSITION, LOCATIONS } from '@/lib/constants';
import type { Product, Location } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { LuxPieChart } from '@/components/charts/PieChart';
import { LuxBarChart } from '@/components/charts/BarChart';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import { ChartSkeleton } from '@/components/skeletons/CardSkeleton';

const PRODUCTS_QUERY = `
  query GetProducts {
    products { id kind brand model serialNumber status location issues components { id isWorking } updatedAt }
  }
`;

const LOCATION_COLORS: Record<Location, string> = {
  Laboratorios: 'rgb(0,122,255)',
  Salones: 'rgb(52,199,89)',
  Administración: 'rgb(255,159,10)',
  Otros: 'rgb(134,134,139)',
};

export function EquipmentStatus() {
  const { data, isLoading } = useAsync<{ products: Product[] }>(() => gql(PRODUCTS_QUERY), []);
  const products = data?.products ?? [];

  const byLocation = LOCATIONS.map(loc => ({
    name: loc,
    value: products.filter(p => p.location === loc).length,
    color: LOCATION_COLORS[loc],
  }));

  const incidentsByLocation = LOCATIONS.map(loc => ({
    label: loc,
    value: products.filter(p => p.location === loc && p.issues).length,
  }));

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-white">Estado de Equipos</h1>
        <p className="text-sm text-[#86868b] mt-0.5">Distribución y estado de equipos por ubicación</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LuxPieChart data={byLocation} title="Equipos por ubicación" />
          <LuxBarChart data={incidentsByLocation} title="Incidentes por ubicación" color="rgb(255,159,10)" />
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_TRANSITION}
          className="rounded-2xl border border-black/8 dark:border-white/5 overflow-hidden bg-white/20 dark:bg-white/2 backdrop-blur-sm"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/8 dark:border-white/5">
                {['Ubicación', 'N° Equipo', 'Estado', 'Última actualización', 'Tipo', 'Fallas'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-widest text-[#86868b]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const statusConf = EQUIPMENT_STATUS_CONFIG[p.status];
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...SPRING_TRANSITION, delay: i * 0.02 }}
                    className="border-b border-black/5 dark:border-white/4 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[#1d1d1f] dark:text-white">{p.location}</td>
                    <td className="px-6 py-4 text-xs text-[#86868b] font-mono">{p.serialNumber}</td>
                    <td className="px-6 py-4">
                      <Badge color={statusConf.color}>{statusConf.label}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#86868b]">{new Date(p.updatedAt).toLocaleDateString('es-UY')}</td>
                    <td className="px-6 py-4 text-sm text-[#86868b]">{p.kind}</td>
                    <td className="px-6 py-4">
                      {p.issues ? (
                        <span className="text-xs text-[rgb(255,159,10)] truncate max-w-[160px] block">{p.issues}</span>
                      ) : (
                        <span className="text-xs text-[#86868b]">Sin fallas</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
