import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Package, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAsync } from '@/hooks/useSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { gql, formatDate } from '@/lib/utils';
import { EQUIPMENT_STATUS_CONFIG, ROUTES, SPRING_TRANSITION } from '@/lib/constants';
import type { Product, Component, EquipmentStatus, Location } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const PRODUCTS_QUERY = `
  query GetProducts($status: String, $location: String) {
    products(status: $status, location: $location) {
      id type kind brand model serialNumber partNumber status issues location
      components { id name model manufacturer serialNumber partNumber isFactory isWorking }
      createdAt updatedAt deletedAt
    }
  }
`;

const COMPONENTS_QUERY = `
  query GetComponents($isWorking: Boolean) {
    components(isWorking: $isWorking) {
      id type name model manufacturer serialNumber partNumber isFactory isWorking productId createdAt updatedAt deletedAt
    }
  }
`;

export function InventoryPage() {
  const { hasRole } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | ''>('');
  const [locationFilter, setLocationFilter] = useState<Location | ''>('');

  const { data: productsData, isLoading: loadingProducts } = useAsync<{ products: Product[] }>(
    () => gql(PRODUCTS_QUERY, { status: statusFilter || undefined, location: locationFilter || undefined }),
    [statusFilter, locationFilter]
  );

  const { data: componentsData, isLoading: loadingComponents } = useAsync<{ components: Component[] }>(
    () => gql(COMPONENTS_QUERY),
    []
  );

  const products = (productsData?.products ?? []).filter(p =>
    !search || `${p.brand} ${p.model} ${p.serialNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  const components = (componentsData?.components ?? []).filter(c =>
    !search || `${c.name} ${c.model} ${c.manufacturer}`.toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = hasRole('root_admin', 'admin', 'tecnico');

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-white">Inventario</h1>
          <p className="text-sm text-[#86868b] mt-0.5">Equipos y componentes del instituto</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link to={`${ROUTES.INVENTORY}/nuevo-componente`}>
                <Cpu className="h-3.5 w-3.5" />
                Componente
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to={`${ROUTES.INVENTORY}/nuevo`}>
                <Plus className="h-3.5 w-3.5" />
                Nuevo equipo
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
          <Input
            placeholder="Buscar por marca, modelo, serie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as EquipmentStatus | '')}
          className="h-10 rounded-xl border border-black/10 bg-white/50 px-3 text-sm text-[#1d1d1f] focus:outline-none focus:border-[rgb(0,122,255)] dark:border-white/10 dark:bg-black/20 dark:text-white cursor-pointer"
        >
          <option value="">Todos los estados</option>
          <option value="available">Disponible</option>
          <option value="in_use">En uso</option>
          <option value="in_repair">En reparación</option>
          <option value="retired">Dado de baja</option>
        </select>
        <select
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value as Location | '')}
          className="h-10 rounded-xl border border-black/10 bg-white/50 px-3 text-sm text-[#1d1d1f] focus:outline-none focus:border-[rgb(0,122,255)] dark:border-white/10 dark:bg-black/20 dark:text-white cursor-pointer"
        >
          <option value="">Todas las ubicaciones</option>
          <option value="Laboratorios">Laboratorios</option>
          <option value="Salones">Salones</option>
          <option value="Administración">Administración</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">
            <Package className="h-3.5 w-3.5" />
            Equipos ({products.length})
          </TabsTrigger>
          <TabsTrigger value="components">
            <Cpu className="h-3.5 w-3.5" />
            Componentes ({components.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {loadingProducts ? (
            <TableSkeleton rows={8} cols={6} />
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-[#86868b] text-sm">No se encontraron equipos</div>
          ) : (
            <div className="rounded-2xl border border-black/8 dark:border-white/5 overflow-hidden bg-white/20 dark:bg-white/2 backdrop-blur-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/8 dark:border-white/5">
                    {['Tipo/Marca/Modelo', 'Serie', 'Estado', 'Ubicación', 'Componentes', 'Actualizado'].map(h => (
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
                        transition={{ ...SPRING_TRANSITION, delay: i * 0.03 }}
                        className="border-b border-black/5 dark:border-white/4 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link to={`${ROUTES.INVENTORY}/${p.id}`} className="hover:underline">
                            <p className="text-sm font-medium text-[#1d1d1f] dark:text-white">{p.brand} {p.model}</p>
                            <p className="text-xs text-[#86868b]">{p.kind}</p>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#86868b] font-mono">{p.serialNumber}</td>
                        <td className="px-6 py-4">
                          <Badge color={statusConf.color}>{statusConf.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#86868b]">{p.location}</td>
                        <td className="px-6 py-4 text-sm text-[#86868b]">{p.components.length}</td>
                        <td className="px-6 py-4 text-xs text-[#86868b]">{formatDate(p.updatedAt)}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="components">
          {loadingComponents ? (
            <TableSkeleton rows={8} cols={6} />
          ) : components.length === 0 ? (
            <div className="text-center py-16 text-[#86868b] text-sm">No se encontraron componentes</div>
          ) : (
            <div className="rounded-2xl border border-black/8 dark:border-white/5 overflow-hidden bg-white/20 dark:bg-white/2 backdrop-blur-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/8 dark:border-white/5">
                    {['Componente', 'Fabricante', 'Serie', 'De fábrica', 'Funcionando', 'Actualizado'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-widest text-[#86868b]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {components.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ ...SPRING_TRANSITION, delay: i * 0.03 }}
                      className="border-b border-black/5 dark:border-white/4 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link to={`${ROUTES.INVENTORY}/componente/${c.id}`} className="hover:underline">
                          <p className="text-sm font-medium text-[#1d1d1f] dark:text-white">{c.name}</p>
                          <p className="text-xs text-[#86868b]">{c.model}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#86868b]">{c.manufacturer}</td>
                      <td className="px-6 py-4 text-xs text-[#86868b] font-mono">{c.serialNumber}</td>
                      <td className="px-6 py-4">
                        <Badge color={c.isFactory ? 'success' : 'muted'}>{c.isFactory ? 'Sí' : 'No'}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={c.isWorking ? 'success' : 'destructive'}>{c.isWorking ? 'Sí' : 'No'}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#86868b]">{formatDate(c.updatedAt)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
