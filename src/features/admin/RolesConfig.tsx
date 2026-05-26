import { motion } from 'motion/react';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { ROLE_LABELS, SPRING_TRANSITION } from '@/lib/constants';
import type { UserRole } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PERMISSIONS: Array<{ label: string; key: string; roles: UserRole[] }> = [
  { label: 'Ver dashboard', key: 'view_dashboard', roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] },
  { label: 'Ver inventario', key: 'view_inventory', roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] },
  { label: 'Editar inventario', key: 'edit_inventory', roles: ['root_admin', 'admin', 'tecnico'] },
  { label: 'Ver tickets', key: 'view_tickets', roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] },
  { label: 'Crear tickets', key: 'create_tickets', roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] },
  { label: 'Asignar tickets', key: 'assign_tickets', roles: ['root_admin', 'admin'] },
  { label: 'Resolver tickets', key: 'resolve_tickets', roles: ['root_admin', 'admin', 'tecnico'] },
  { label: 'Ver préstamos', key: 'view_loans', roles: ['root_admin', 'admin', 'tecnico'] },
  { label: 'Gestionar préstamos', key: 'manage_loans', roles: ['root_admin', 'admin'] },
  { label: 'Ver solicitudes', key: 'view_services', roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] },
  { label: 'Gestionar solicitudes', key: 'manage_services', roles: ['root_admin', 'admin', 'tecnico'] },
  { label: 'Panel de admin', key: 'admin_panel', roles: ['root_admin', 'admin'] },
  { label: 'Gestionar usuarios', key: 'manage_users', roles: ['root_admin', 'admin'] },
  { label: 'Ver logs de actividad', key: 'view_logs', roles: ['root_admin', 'admin'] },
  { label: 'Exportar datos', key: 'export_data', roles: ['root_admin', 'admin'] },
];

const ROLES: UserRole[] = ['root_admin', 'admin', 'tecnico', 'solicitante'];

export function RolesConfig() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">Roles y Permisos</h1>
        <p className="text-sm text-[#86868b] mt-0.5">Matriz de control de acceso por rol</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_TRANSITION}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Matriz RBAC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-black/8 dark:border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/8 dark:border-white/5">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[#86868b]">Permiso</th>
                    {ROLES.map(r => (
                      <th key={r} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-widest text-[#86868b]">
                        {ROLE_LABELS[r]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((perm, i) => (
                    <motion.tr
                      key={perm.key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ ...SPRING_TRANSITION, delay: i * 0.02 }}
                      className="border-b border-black/5 dark:border-white/4 last:border-0 hover:bg-black/2 dark:hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-[#1d1d1f] dark:text-white">{perm.label}</td>
                      {ROLES.map(r => (
                        <td key={r} className="px-4 py-3 text-center">
                          {perm.roles.includes(r) ? (
                            <CheckCircle2 className="h-4 w-4 text-[rgb(52,199,89)] mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-black/15 dark:text-white/15 mx-auto" />
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[#86868b] mt-4">
              Los cambios de permisos toman efecto en la próxima sesión del usuario. El rol root_admin no puede ser modificado ni eliminado.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
