import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app-light dark:bg-app-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="text-center space-y-4"
      >
        <p className="text-8xl font-semibold tracking-[-0.04em] text-black/10 dark:text-white/10">404</p>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-white">
          Página no encontrada
        </h1>
        <p className="text-sm text-[#86868b] max-w-xs">
          La página que buscás no existe o fue movida.
        </p>
        <Button asChild variant="secondary" className="mt-4">
          <Link to={ROUTES.DASHBOARD}>
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
