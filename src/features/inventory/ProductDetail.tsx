import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { useAsync } from '@/hooks/useSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { gql, formatDate } from '@/lib/utils';
import { EQUIPMENT_STATUS_CONFIG, ROUTES } from '@/lib/constants';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

const PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id type kind brand model serialNumber partNumber status issues location
      components { id name model manufacturer serialNumber partNumber isFactory isWorking }
      createdAt updatedAt deletedAt
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

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const { data, isLoading, error } = useAsync<{ product: Product | null }>(
    () => gql(PRODUCT_QUERY, { id }),
    [id]
  );

  const product = data?.product;
  const canEdit = hasRole('root_admin', 'admin', 'tecnico');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.INVENTORY}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          {isLoading ? (
            <div className="h-6 w-48 bg-black/8 dark:bg-white/8 rounded animate-pulse" />
          ) : (
            <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
              {product ? `${product.brand} ${product.model}` : 'Equipo no encontrado'}
            </h1>
          )}
        </div>
        {canEdit && product && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link to={`${ROUTES.INVENTORY}/${id}/editar`}>
                <Edit2 className="h-3.5 w-3.5" />
                Editar
              </Link>
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-3.5 w-3.5" />
              Dar de baja
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-[rgba(255,69,58,0.08)] border border-[rgba(255,69,58,0.2)] p-4 text-sm text-[rgb(255,69,58)]">
          Error: {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-16 bg-black/8 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-black/8 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : product ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información del equipo</CardTitle>
                <Badge color={EQUIPMENT_STATUS_CONFIG[product.status].color}>
                  {EQUIPMENT_STATUS_CONFIG[product.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <DetailRow label="Tipo" value={product.kind} />
                <DetailRow label="Marca" value={product.brand} />
                <DetailRow label="Modelo" value={product.model} />
                <DetailRow label="N° de serie" value={<span className="font-mono text-xs">{product.serialNumber}</span>} />
                <DetailRow label="Part number" value={<span className="font-mono text-xs">{product.partNumber}</span>} />
                <DetailRow label="Ubicación" value={product.location} />
                <DetailRow label="Registrado" value={formatDate(product.createdAt)} />
                <DetailRow label="Actualizado" value={formatDate(product.updatedAt)} />
                {product.issues && (
                  <div className="col-span-full">
                    <DetailRow
                      label="Fallas / Observaciones"
                      value={<span className="text-[rgb(255,159,10)]">{product.issues}</span>}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Componentes ({product.components.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {product.components.length === 0 ? (
                <p className="text-sm text-[#86868b]">Sin componentes registrados</p>
              ) : (
                <div className="rounded-xl border border-black/8 dark:border-white/5 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black/8 dark:border-white/5">
                        {['Componente', 'Modelo', 'Fabricante', 'Serie', 'De fábrica', 'Funciona'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[#86868b]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {product.components.map(c => (
                        <tr key={c.id} className="border-b border-black/5 dark:border-white/4 last:border-0 hover:bg-black/2 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[#1d1d1f] dark:text-white">{c.name}</td>
                          <td className="px-4 py-3 text-sm text-[#86868b]">{c.model}</td>
                          <td className="px-4 py-3 text-sm text-[#86868b]">{c.manufacturer}</td>
                          <td className="px-4 py-3 text-xs text-[#86868b] font-mono">{c.serialNumber}</td>
                          <td className="px-4 py-3"><Badge color={c.isFactory ? 'success' : 'muted'}>{c.isFactory ? 'Sí' : 'No'}</Badge></td>
                          <td className="px-4 py-3"><Badge color={c.isWorking ? 'success' : 'destructive'}>{c.isWorking ? 'Sí' : 'No'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : !isLoading && (
        <div className="text-center py-16 text-[#86868b]">Equipo no encontrado</div>
      )}
    </div>
  );
}
