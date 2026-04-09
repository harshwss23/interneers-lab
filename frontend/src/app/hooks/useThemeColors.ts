import { useTheme } from '../contexts/ThemeContext';

export function useThemeColors() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    bg: isDark ? 'bg-slate-950' : 'bg-slate-50',
    card: isDark ? 'bg-slate-900' : 'bg-white',
    text: isDark ? 'text-white' : 'text-slate-900',
    muted: isDark ? 'text-slate-400' : 'text-slate-500',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    primary: 'text-blue-500',
  };
}
