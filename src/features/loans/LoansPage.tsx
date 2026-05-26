import { useState } from 'react';
import { Plus, RotateCcw, CheckCircle } from 'lucide-react';
import { useAsync } from '@/hooks/useSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { gql, formatDate, isOverdue, cn } from '@/lib/utils';
import { LOAN_STATUS_CONFIG } from '@/lib/constants';
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

 // Skeletons are shown ONLY on first mount (when we don't have data yet)
 const showSkeleton = isLoading && !data;

 return (
 <div className="space-y-8 max-w-6xl">
 <div className="flex items-end justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-foreground">Préstamos</h1>
 <p className="text-sm text-muted-foreground mt-0.5">Gestión de préstamos de equipos</p>
 </div>
 <Button size="sm" onClick={() => setCreateOpen(true)}>
 <Plus className="h-3.5 w-3.5" />
 Registrar préstamo
 </Button>
 </div>

 {showSkeleton ? (
 <div className="grid grid-cols-3 gap-4">
 {Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={i} />)}
 </div>
 ) : (
 <div className={cn(
"grid grid-cols-1 sm:grid-cols-3 gap-4 transition-all duration-300 ease-out",
 isLoading &&"opacity-75 blur-xs pointer-events-none" )}>
 {[
 { label: 'Activos', value: activeCount, color: 'rgb(0,122,255)' },
 { label: 'Vencidos', value: overdueCount, color: 'rgb(255,69,58)' },
 { label: 'Tasa de devolución a tiempo', value: `${onTimeRate}%`, color: 'rgb(52,199,89)' },
 ].map((m) => (
 <div
 key={m.label}
 className="rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:border-primary/20 hover:bg-card/75 hover:shadow-md" >
 <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">{m.label}</p>
 <p className="text-3xl font-bold tracking-tight" style={{ color: m.color }}>{m.value}</p>
 </div>
 ))}
 </div>
 )}

 <div className="flex gap-3">
 <select
 value={statusFilter}
 onChange={e => setStatusFilter(e.target.value as LoanStatus | '')}
 className="h-10 rounded-xl border border-input bg-card/50 px-3 text-sm text-foreground focus:outline-none focus:border-ring cursor-pointer" >
 <option value="">Todos los estados</option>
 <option value="pending">Pendiente</option>
 <option value="approved">Aprobado</option>
 <option value="active">Activo</option>
 <option value="overdue">Vencido</option>
 <option value="returned">Devuelto</option>
 </select>
 </div>

 {showSkeleton ? (
 <TableSkeleton rows={8} cols={6} />
 ) : loans.length === 0 ? (
 <div className="text-center py-16 text-muted-foreground text-sm font-medium">No hay préstamos</div>
 ) : (
 <div className={cn(
"rounded-2xl border border-border/70 overflow-x-auto bg-card/20 backdrop-blur-sm transition-all duration-300 ease-out",
 isLoading &&"opacity-75 blur-xs pointer-events-none" )}>
 <table className="w-full">
 <thead>
 <tr className="border-b border-border">
 {['Equipo', 'Usuario', 'Estado', 'Aprobado por', 'Vencimiento', 'Alta', 'Acciones'].map(h => (
 <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {loans.map((l) => {
 const statusConf = LOAN_STATUS_CONFIG[l.status];
 const actuallyOverdue = l.status === 'active' && isOverdue(l.returnDate);
 return (
 <tr
 key={l.id}
 className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors" >
 <td className="px-6 py-4">
 <p className="text-sm font-semibold text-foreground">{l.equipment.brand} {l.equipment.model}</p>
 <p className="text-xs text-muted-foreground font-medium">{l.equipment.location}</p>
 </td>
 <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{l.user.name}</td>
 <td className="px-6 py-4">
 <Badge color={actuallyOverdue ? 'destructive' : statusConf.color} withDot>
 {actuallyOverdue ? 'Vencido' : statusConf.label}
 </Badge>
 </td>
 <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{l.approvedBy?.name ?? '—'}</td>
 <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(l.returnDate)}</td>
 <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(l.issueDate)}</td>
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
 </tr>
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
