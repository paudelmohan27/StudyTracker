/**
 * Animated horizontal progress bar.
 * Props:
 *   value      – 0–100
 *   color      – optional hex/css color for fill (overrides default logic)
 *   showLabel  – show percentage text inside bar
 *   size       – 'sm' | 'md' | 'lg'
 */
export default function ProgressBar({ value = 0, color, showLabel = false, size = 'md' }) {
  const clamped = Math.min(100, Math.max(0, value));

  // Color logic: green ≥ 80, amber 40–79, red < 40
  const autoColor =
    clamped >= 80
      ? '#10b981' // emerald-500
      : clamped >= 40
      ? '#f59e0b' // amber-500
      : '#ef4444'; // red-500

  const fill = color || autoColor;

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className={`w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden ${heights[size]}`}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1"
        style={{ width: `${clamped}%`, backgroundColor: fill }}
      >
        {showLabel && size === 'lg' && (
          <span className="text-white text-xs font-bold">{clamped}%</span>
        )}
      </div>
    </div>
  );
}
