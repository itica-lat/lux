import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { useAsync } from '@/hooks/useSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { gql, formatDate, truncate } from '@/lib/utils';
import { TICKET_STATUS_CONFIG, TICKET_CATEGORY_LABELS, ROUTES, SPRING_TRANSITION } from '@/lib/constants';
import type { Ticket, TicketStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, AnimatePresence } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TICKETS_QUERY = `
  query GetTickets($submittedById: ID) {
    tickets(submittedById: $submittedById) {
      id title description category status
      submittedBy { id name }
      assignedTo { id name }
      equipmentId createdAt updatedAt
    }
  }
`;

const CREATE_TICKET_MUTATION = `
  mutation CreateTicket($input: TicketInput!) {
    createTicket(input: $input) { id }
  }
`;

export function TicketList() {
  const { user, hasRole } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'hardware', equipmentId: '' });
  const [saving, setSaving] = useState(false);

  const isSolicitante = !hasRole('root_admin', 'admin', 'tecnico');

  const { data, isLoading, error, refetch } = useAsync<{ tickets: Ticket[] }>(
    () => gql(TICKETS_QUERY, { submittedById: isSolicitante ? user?.id : undefined }),
    [isSolicitante, user?.id]
  );

  const tickets = (data?.tickets ?? []).filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      await gql(CREATE_TICKET_MUTATION, {
        input: {
          title: form.title,
          description: form.description,
          category: form.category,
          equipmentId: form.equipmentId || undefined,
        },
      });
      setCreateOpen(false);
      setForm({ title: '', description: '', category: 'hardware', equipmentId: '' });
      refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-white">Tickets</h1>
          <p className="text-sm text-[#86868b] mt-0.5">Mesa de ayuda</p>
        </div>
        <div className="flex gap-2">
          {!hasRole('root_admin', 'admin', 'tecnico') && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Nuevo ticket
            </Button>
          )}
          {hasRole('root_admin', 'admin', 'tecnico') && (
            <Button variant="secondary" size="sm" asChild>
              <Link to={`${ROUTES.TICKETS}/ool`}>
                <AlertCircle className="h-3.5 w-3.5" />
                OOL
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
          <Input placeholder="Buscar tickets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as TicketStatus | '')}
          className="h-10 rounded-xl border border-black/10 bg-white/50 px-3 text-sm text-[#1d1d1f] focus:outline-none focus:border-[rgb(0,122,255)] dark:border-white/10 dark:bg-black/20 dark:text-white cursor-pointer"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in_progress">En progreso</option>
          <option value="in_resolution">En resolución</option>
          <option value="resolved">Resuelto</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl bg-[rgba(255,69,58,0.08)] border border-[rgba(255,69,58,0.2)] p-4 text-sm text-[rgb(255,69,58)]">
          Error: {error}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-[#86868b] text-sm">No hay tickets</div>
      ) : (
        <div className="rounded-2xl border border-black/8 dark:border-white/5 overflow-hidden bg-white/20 dark:bg-white/2 backdrop-blur-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/8 dark:border-white/5">
                {['ID', 'Título', 'Estado', 'Categoría', 'Asignado a', 'Solicitante', 'Fecha'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-widest text-[#86868b]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t, i) => {
                const statusConf = TICKET_STATUS_CONFIG[t.status];
                return (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...SPRING_TRANSITION, delay: i * 0.02 }}
                    className="border-b border-black/5 dark:border-white/4 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-[#86868b] font-mono">{t.id}</td>
                    <td className="px-6 py-4">
                      {hasRole('root_admin', 'admin', 'tecnico') ? (
                        <Link to={`${ROUTES.TICKETS}/${t.id}`} className="text-sm font-medium text-[#1d1d1f] dark:text-white hover:underline">
                          {truncate(t.title, 48)}
                        </Link>
                      ) : (
                        <span className="text-sm text-[#1d1d1f] dark:text-white">{truncate(t.title, 48)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={statusConf.color}>{statusConf.label}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#86868b]">{TICKET_CATEGORY_LABELS[t.category]}</td>
                    <td className="px-6 py-4 text-sm text-[#86868b]">{t.assignedTo?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-[#86868b]">{t.submittedBy.name}</td>
                    <td className="px-6 py-4 text-xs text-[#86868b]">{formatDate(t.createdAt)}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {createOpen && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nuevo ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Título</Label>
                  <Input placeholder="Descripción breve del problema" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Descripción</Label>
                  <Textarea placeholder="Describí el problema en detalle..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-28" />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="network">Red</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={saving || !form.title.trim()}>
                  {saving ? 'Enviando...' : 'Enviar ticket'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
