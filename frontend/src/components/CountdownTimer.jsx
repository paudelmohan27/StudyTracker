import { useEffect, useState } from 'react';
import { formatDistanceToNow, isPast, differenceInDays } from 'date-fns';

/**
 * Displays a live countdown to a given exam date.
 * Shows days/hours/minutes remaining and color-codes urgency.
 */
export default function CountdownTimer({ examDate }) {
  const [display, setDisplay] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [overdue, setOverdue] = useState(false);

  useEffect(() => {
    if (!examDate) return;

    const update = () => {
      const date = new Date(examDate);
      const past = isPast(date);
      const days = differenceInDays(date, new Date());

      setOverdue(past);
      setUrgent(!past && days <= 7);
      setDisplay(past
        ? `Exam was ${formatDistanceToNow(date, { addSuffix: true })}`
        : `${formatDistanceToNow(date, { addSuffix: true })}`
      );
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [examDate]);

  if (!examDate) {
    return <span className="text-xs text-gray-400">No exam date set</span>;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
        overdue
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          : urgent
          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 animate-pulse'
          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
      }`}
    >
      {overdue ? '⏰ Overdue –' : urgent ? '⚠️' : '📅'} {display}
    </span>
  );
}
