import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PAGE_TRANSITION } from '@/lib/constants';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <div className={cn('flex h-screen overflow-hidden', theme === 'dark' ? 'bg-app-dark' : 'bg-app-light')}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              {...PAGE_TRANSITION}
              className="min-h-full p-6 lg:p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
