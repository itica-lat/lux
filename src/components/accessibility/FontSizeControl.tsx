import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import type { FontSize } from '@/lib/types';

const sizes: { label: string; value: FontSize }[] = [
  { label: 'A', value: 'sm' },
  { label: 'A', value: 'md' },
  { label: 'A', value: 'lg' },
  { label: 'A', value: 'xl' },
];

export function FontSizeControl() {
  const { fontSize, setFontSize } = useTheme();
  return (
    <div className="flex items-center gap-1">
      {sizes.map((s, i) => (
        <button
          key={s.value}
          onClick={() => setFontSize(s.value)}
          aria-label={`Tamaño de fuente ${s.value}`}
          className={`rounded-lg px-2 py-1 transition-colors cursor-pointer ${
            fontSize === s.value
              ? 'bg-black/10 dark:bg-white/15 text-[#1d1d1f] dark:text-white'
              : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8'
          }`}
          style={{ fontSize: `${10 + i * 2}px`, fontWeight: 500 }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export { Button };
