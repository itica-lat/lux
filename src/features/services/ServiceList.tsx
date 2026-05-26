import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useAsync } from '@/hooks/useSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { gql, formatDate, truncate } from '@/lib/utils';
import { SERVICE_STATUS_CONFIG, SERVICE_TYPE_LABELS, ROUTES, SPRING_TRANSITION } from '@/lib/constants';
import type { ServiceRequest, ServiceStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ServiceForm } from './ServiceForm';

const SERVICES_QUERY = `
  query GetServiceRequests($requestedById: ID) {
    serviceRequests(requestedById: $requestedById) {
      id type status description labNumber softwareName equipmentId resolutionText
      requestedBy { id name }
      createdAt updatedAt
    }
  }
`;

export function ServiceList() {
  const { user, hasRole } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | ''>('');
  const [createOpen, setCreateOpen] = useState(false);

  const isSolicitante = !hasRole('root_admin', 'admin', 'tecnico');

  const { data, isLoading, refetch } = useAsync<{ serviceRequests: ServiceRequest[] }>(
    () => gql(SERVICES_QUERY, { requestedById: isSolicitante ? user?.id : undefined }),
    [isSolicitante, user?.id]
  );

  const services = (data?.serviceRequests ?? []).filter(s =>
    !statusFilter || s.status === statusFilter
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-white">Solicitudes de Servicio</h1>
          <p className="text-sm text-[#86868b] mt-0.5">Gestión de solicitudes del instituto</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Nueva solicitud
        </Button>
      </div>

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as ServiceStatus | '')}
          className="h-10 rounded-xl border border-black/10 bg-white/50 px-3 text-sm text-[#1d1d1f] focus:outline-none focus:border-[rgb(0,122,255)] dark:border-white/10 dark:bg-black/20 dark:text-white cursor-pointer"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="in_progress">En progreso</option>
          <option value="completed">Completado</option>
          <option value="rejected">Rechazado</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-[#86868b] text-sm">No hay solicitudes de servicio</div>
      ) : (
        <div className="rounded-2xl border border-black/8 dark:border-white/5 overflow-hidden bg-white/20 dark:bg-white/2 backdrop-blur-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/8 dark:border-white/5">
                {['ID', 'Tipo', 'Descripción', 'Estado', 'Solicitante', 'Fecha', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-widest text-[#86868b]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => {
                const statusConf = SERVICE_STATUS_CONFIG[s.status];
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...SPRING_TRANSITION, delay: i * 0.03 }}
                    className="border-b border-black/5 dark:border-white/4 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-[#86868b] font-mono">{s.id}</td>
                    <td className="px-6 py-4 text-sm text-[#86868b]">{SERVICE_TYPE_LABELS[s.type]}</td>
                    <td className="px-6 py-4 text-sm text-[#1d1d1f] dark:text-white max-w-[200px]">
                      {truncate(s.description, 60)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={statusConf.color}>{statusConf.label}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#86868b]">{s.requestedBy.name}</td>
                    <td className="px-6 py-4 text-xs text-[#86868b]">{formatDate(s.createdAt)}</td>
                    <td className="px-6 py-4">
                      {hasRole('root_admin', 'admin', 'tecnico') && (
                        <Link
                          to={`${ROUTES.SERVICES}/${s.id}`}
                          className="text-xs text-[rgb(0,122,255)] hover:underline"
                        >
                          Ver detalle
                        </Link>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva solicitud de servicio</DialogTitle>
          </DialogHeader>
          <ServiceForm onSuccess={() => { setCreateOpen(false); refetch(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
