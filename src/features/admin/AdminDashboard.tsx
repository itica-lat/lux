import { motion } from 'motion/react';
import { Users, Shield, ActivitySquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES, SPRING_TRANSITION } from '@/lib/constants';
import { useAsync } from '@/hooks/useSkeleton';
import { gql } from '@/lib/utils';
import type { User } from '@/lib/types';

const USERS_QUERY = `query GetUsers { users { id isActive role } }`;

export function AdminDashboard() {
  const { data } = useAsync<{ users: Array<Pick<User, 'id' | 'isActive' | 'role'>> }>(
    () => gql(USERS_QUERY),
    []
  );

  const users = data?.users ?? [];
  const activeUsers = users.filter(u => u.isActive).length;

  const cards = [
    {
      icon: Users,
      title: 'Gestión de Usuarios',
      description: `${activeUsers} usuarios activos · ${users.length} total`,
      to: ROUTES.ADMIN_USERS,
      color: 'rgb(0,122,255)',
    },
    {
      icon: Shield,
      title: 'Roles y Permisos',
      description: `Control de acceso basado en roles`,
      to: ROUTES.ADMIN_ROLES,
      color: 'rgb(255,159,10)',
    },
    {
      icon: ActivitySquare,
      title: 'Registros de Actividad',
      description: `Historial completo del sistema`,
      to: ROUTES.ADMIN_LOGS,
      color: 'rgb(52,199,89)',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">Panel de Administración</h1>
        <p className="text-sm text-[#86868b] mt-0.5">Configuración y supervisión del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, title, description, to, color }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_TRANSITION, delay: i * 0.08 }}
          >
            <Link
              to={to}
              className="block rounded-2xl border border-black/8 dark:border-white/5 bg-white/40 dark:bg-[#0a0a0c]/40 backdrop-blur-xl p-6 hover:border-black/15 dark:hover:border-white/10 transition-colors group"
            >
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-1">{title}</h3>
              <p className="text-xs text-[#86868b] mb-4">{description}</p>
              <div className="flex items-center gap-1 text-xs text-[rgb(0,122,255)] group-hover:gap-2 transition-all">
                Ir a {title.toLowerCase()}
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
