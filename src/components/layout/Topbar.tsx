import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeSwitcher } from '@/components/accessibility/ThemeSwitcher';
import { FontSizeControl } from '@/components/accessibility/FontSizeControl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES, ROLE_LABELS } from '@/lib/constants';

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

export function Topbar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 glass-topbar-light dark:glass-topbar-dark">
      <div />
      <div className="flex items-center gap-3">
        <FontSizeControl />
        <ThemeSwitcher />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-xl px-2 py-1 hover:bg-black/5 dark:hover:bg-white/8 transition-colors cursor-pointer">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-medium text-[#1d1d1f] dark:text-white leading-none">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-[#86868b] leading-none mt-0.5">
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold text-[#1d1d1f] dark:text-white text-xs normal-case tracking-normal">{user.name}</span>
                  <span className="font-normal text-[#86868b]">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={ROUTES.PROFILE} className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              {hasRole('root_admin', 'admin') && (
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.ADMIN} className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Panel Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-[rgb(255,69,58)] hover:text-[rgb(255,69,58)] focus:text-[rgb(255,69,58)]"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
