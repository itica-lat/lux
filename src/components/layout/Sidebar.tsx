import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  Monitor,
  Ticket,
  BookOpen,
  Wrench,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { SPRING_TRANSITION } from '@/lib/constants';

const navItems = [
  { icon: LayoutDashboard, label: 'Inicio', to: ROUTES.DASHBOARD, roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] as const },
  { icon: Package, label: 'Inventario', to: ROUTES.INVENTORY, roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] as const },
  { icon: Monitor, label: 'Estado de Equipos', to: ROUTES.EQUIPMENT_STATUS, roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] as const },
  { icon: Ticket, label: 'Tickets', to: ROUTES.TICKETS, roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] as const },
  { icon: BookOpen, label: 'Préstamos', to: ROUTES.LOANS, roles: ['root_admin', 'admin', 'tecnico'] as const },
  { icon: Wrench, label: 'Solicitudes', to: ROUTES.SERVICES, roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] as const },
  { icon: User, label: 'Perfil', to: ROUTES.PROFILE, roles: ['root_admin', 'admin', 'tecnico', 'solicitante'] as const },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const visibleItems = navItems.filter(item =>
    user && item.roles.some(r => r === user.role)
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={SPRING_TRANSITION}
      className="relative flex h-full flex-col glass-sidebar-light dark:glass-sidebar-dark overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 h-14">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgb(0,122,255)]">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                Lux
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[rgb(0,122,255)]">
            <Zap className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 cursor-pointer',
                'hover:bg-black/5 dark:hover:bg-white/8',
                isActive
                  ? 'bg-white/60 text-[#1d1d1f] font-medium shadow-sm dark:bg-white/12 dark:text-white'
                  : 'text-[#86868b] dark:text-[#86868b]',
                collapsed && 'justify-center px-2'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate overflow-hidden whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-black/5 dark:border-white/5">
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/8 transition-colors cursor-pointer',
            collapsed && 'justify-center px-2'
          )}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Colapsar</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
