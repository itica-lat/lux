import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useAsync } from '@/hooks/useSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { gql, formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { Component } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const COMPONENT_QUERY = `
  query GetComponent($id: ID!) {
    component(id: $id) {
      id type name model manufacturer serialNumber partNumber isFactory isWorking productId createdAt updatedAt deletedAt
    }
  }
`;

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#86868b] uppercase tracking-widest font-medium">{label}</span>
      <span className="text-sm text-[#1d1d1f] dark:text-white">{value ?? '—'}</span>
    </div>
  );
}

export function ComponentDetail() {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const { data, isLoading, error } = useAsync<{ component: Component | null }>(
    () => gql(COMPONENT_QUERY, { id }),
    [id]
  );

  const component = data?.component;
  const canEdit = hasRole('root_admin', 'admin', 'tecnico');

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.INVENTORY}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white flex-1">
          {isLoading ? '...' : (component ? `${component.name} — ${component.model}` : 'Componente no encontrado')}
        </h1>
        {canEdit && component && (
          <Button variant="secondary" size="sm">
            <Edit2 className="h-3.5 w-3.5" />
            Editar
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-[rgba(255,69,58,0.08)] border border-[rgba(255,69,58,0.2)] p-4 text-sm text-[rgb(255,69,58)]">
          Error: {error}
        </div>
      )}

      {component && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información del componente</CardTitle>
                <div className="flex gap-2">
                  <Badge color={component.isFactory ? 'info' : 'muted'}>
                    {component.isFactory ? 'De fábrica' : 'Reemplazo'}
                  </Badge>
                  <Badge color={component.isWorking ? 'success' : 'destructive'}>
                    {component.isWorking ? 'Funcionando' : 'Con falla'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <DetailRow label="Nombre" value={component.name} />
                <DetailRow label="Modelo" value={component.model} />
                <DetailRow label="Fabricante" value={component.manufacturer} />
                <DetailRow label="N° de serie" value={<span className="font-mono text-xs">{component.serialNumber}</span>} />
                <DetailRow label="Part number" value={<span className="font-mono text-xs">{component.partNumber}</span>} />
                <DetailRow label="Equipo padre" value={component.productId ?? 'Independiente'} />
                <DetailRow label="Registrado" value={formatDate(component.createdAt)} />
                <DetailRow label="Actualizado" value={formatDate(component.updatedAt)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
