import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, RotateCcw, CheckCircle } from 'lucide-react';
import { useAsync } from '@/hooks/useSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { gql, formatDate, isOverdue } from '@/lib/utils';
import { LOAN_STATUS_CONFIG, SPRING_TRANSITION } from '@/lib/constants';
import type { Loan, LoanStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import { MetricCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoanForm } from './LoanForm';

const LOANS_QUERY = `
  query GetLoans($status: String) {
    loans(status: $status) {
      id status issueDate returnDate actualReturnDate rejectionReason
      equipment { id brand model serialNumber location }
      user { id name }
      approvedBy { id name }
      components { id name }
      createdAt updatedAt
    }
  }
`;

const RETURN_MUTATION = `
  mutation ReturnLoan($id: ID!) { returnLoan(id: $id) { id status } }
`;
const APPROVE_MUTATION = `
  mutation ApproveLoan($id: ID!) { approveLoan(id: $id) { id status } }
`;

export function LoansPage() {
  const [statusFilter, setStatusFilter] = useState<LoanStatus | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const { hasRole } = useAuth();

  const { data, isLoading, refetch } = useAsync<{ loans: Loan[] }>(
    () => gql(LOANS_QUERY, { status: statusFilter || undefined }),
    [statusFilter]
  );

  const loans = data?.loans ?? [];
  const activeCount = loans.filter(l => l.status === 'active').length;
  const overdueCount = loans.filter(l => l.status === 'overdue' || (l.status === 'active' && isOverdue(l.returnDate))).length;
  const returned = loans.filter(l => l.status === 'returned');
  const onTimeRate = returned.length > 0
    ? Math.round((returned.filter(l => l.actualReturnDate && l.actualReturnDate <= l.returnDate).length / returned.length) * 100)
    : 0;

  const handleReturn = async (id: string) => {
    await gql(RETURN_MUTATION, { id });
    refetch();
  };

  const handleApprove = async (id: string) => {
    await gql(APPROVE_MUTATION, { id });
    refetch();
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-white">Préstamos</h1>
          <p className="text-sm text-[#86868b] mt-0.5">Gestión de préstamos de equipos</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Registrar préstamo
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Activos', value: activeCount, color: 'rgb(0,122,255)' },
            { label: 'Vencidos', value: overdueCount, color: 'rgb(255,69,58)' },
            { label: 'Tasa de devolución a tiempo', value: `${onTimeRate}%`, color: 'rgb(52,199,89)' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_TRANSITION, delay: i * 0.05 }}
              className="rounded-2xl border border-black/8 dark:border-white/5 bg-white/40 dark:bg-[#0a0a0c]/40 backdrop-blur-xl p-6"
            >
              <p className="text-xs text-[#86868b] uppercase tracking-widest font-medium mb-1">{m.label}</p>
              <p className="text-3xl font-medium tracking-tight" style={{ color: m.color }}>{m.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as LoanStatus | '')}
          className="h-10 rounded-xl border border-black/10 bg-white/50 px-3 text-sm text-[#1d1d1f] focus:outline-none focus:border-[rgb(0,122,255)] dark:border-white/10 dark:bg-black/20 dark:text-white cursor-pointer"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="active">Activo</option>
          <option value="overdue">Vencido</option>
          <option value="returned">Devuelto</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : loans.length === 0 ? (
        <div className="text-center py-16 text-[#86868b] text-sm">No hay préstamos</div>
      ) : (
        <div className="rounded-2xl border border-black/8 dark:border-white/5 overflow-hidden bg-white/20 dark:bg-white/2 backdrop-blur-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/8 dark:border-white/5">
                {['Equipo', 'Usuario', 'Estado', 'Aprobado por', 'Vencimiento', 'Alta', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-widest text-[#86868b]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loans.map((l, i) => {
                const statusConf = LOAN_STATUS_CONFIG[l.status];
                const actuallyOverdue = l.status === 'active' && isOverdue(l.returnDate);
                return (
                  <motion.tr
                    key={l.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...SPRING_TRANSITION, delay: i * 0.02 }}
                    className="border-b border-black/5 dark:border-white/4 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#1d1d1f] dark:text-white">{l.equipment.brand} {l.equipment.model}</p>
                      <p className="text-xs text-[#86868b]">{l.equipment.location}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#86868b]">{l.user.name}</td>
                    <td className="px-6 py-4">
                      <Badge color={actuallyOverdue ? 'destructive' : statusConf.color}>
                        {actuallyOverdue ? 'Vencido' : statusConf.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#86868b]">{l.approvedBy?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-xs text-[#86868b]">{formatDate(l.returnDate)}</td>
                    <td className="px-6 py-4 text-xs text-[#86868b]">{formatDate(l.issueDate)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        {l.status === 'pending' && hasRole('root_admin', 'admin') && (
                          <Button size="sm" variant="secondary" onClick={() => handleApprove(l.id)}>
                            <CheckCircle className="h-3.5 w-3.5" />
                            Aprobar
                          </Button>
                        )}
                        {['active', 'approved', 'overdue'].includes(l.status) && (
                          <Button size="sm" variant="secondary" onClick={() => handleReturn(l.id)}>
                            <RotateCcw className="h-3.5 w-3.5" />
                            Devolver
                          </Button>
                        )}
                      </div>
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
            <DialogTitle>Registrar préstamo</DialogTitle>
          </DialogHeader>
          <LoanForm onSuccess={() => { setCreateOpen(false); refetch(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
