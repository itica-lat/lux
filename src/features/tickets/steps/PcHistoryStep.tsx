import { useAsync } from '@/hooks/useSkeleton';
import { gql, formatDate } from '@/lib/utils';
import { TICKET_STATUS_CONFIG } from '@/lib/constants';
import type { Ticket } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const TICKETS_QUERY = `
  query GetTickets($submittedById: ID) {
    tickets(submittedById: $submittedById) {
      id title category status assignedTo { name } diagnosis createdAt resolvedAt
    }
  }
`;

interface PcHistoryStepProps {
  ticket: Ticket;
}

export function PcHistoryStep({ ticket }: PcHistoryStepProps) {
  const { data, isLoading } = useAsync<{ tickets: Ticket[] }>(
    () => gql(TICKETS_QUERY, {}),
    []
  );

  const history = (data?.tickets ?? []).filter(
    t => t.equipmentId === ticket.equipmentId && t.id !== ticket.id && ticket.equipmentId
  );

  if (!ticket.equipment) {
    return (
      <div className="text-center py-12 text-[#86868b] text-sm">
        No hay equipo asociado para mostrar historial.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white mb-1">Historial del equipo</h2>
        <p className="text-xs text-[#86868b]">
          {ticket.equipment.location} · {ticket.equipment.serialNumber}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-[#86868b] text-sm">
          Sin incidentes previos registrados para este equipo.
        </div>
      ) : (
        <div className="rounded-xl border border-black/8 dark:border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/8 dark:border-white/5">
                {['ID', 'Título', 'Tipo', 'Estado', 'Asignado a', 'Diagnóstico', 'Fecha'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-widest text-[#86868b]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(t => {
                const statusConf = TICKET_STATUS_CONFIG[t.status];
                return (
                  <tr key={t.id} className="border-b border-black/5 dark:border-white/4 last:border-0 hover:bg-black/2 transition-colors">
                    <td className="px-4 py-3 text-xs text-[#86868b] font-mono">{t.id}</td>
                    <td className="px-4 py-3 text-sm text-[#1d1d1f] dark:text-white max-w-[160px] truncate">{t.title}</td>
                    <td className="px-4 py-3 text-xs text-[#86868b]">{t.category}</td>
                    <td className="px-4 py-3"><Badge color={statusConf.color}>{statusConf.label}</Badge></td>
                    <td className="px-4 py-3 text-sm text-[#86868b]">{t.assignedTo?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#86868b] max-w-[160px] truncate">{t.diagnosis ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#86868b]">{formatDate(t.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
