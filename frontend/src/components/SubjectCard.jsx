import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import CountdownTimer from './CountdownTimer';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Premium subject card with drag-and-drop, glassmorphism, and cohesive design system tokens.
 */
export default function SubjectCard({ subject, onEdit, onDelete }) {
  const { _id, name, icon, color, examDate, averageProgress, totalTopics, completedTopics, isBehindSchedule, isUrgent, isOverdue } = subject;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: _id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const accentColor = color || '#6366f1';

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
        opacity: isDragging ? 0.5 : 1,
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
      className={`group relative flex flex-col gap-4 rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${
        isDragging ? 'shadow-2xl ring-2 ring-primary-500/50 scale-105' : ''
      }`}
    >
      {/* Colored top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: accentColor }} />
      {/* Subtle gradient sheen from accent color */}
      <div
        className="absolute top-0 left-0 right-0 h-24 opacity-[0.06] pointer-events-none rounded-t-2xl"
        style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }}
      />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3.5 right-3.5 p-1.5 cursor-grab active:cursor-grabbing text-slate-300 dark:text-white/20 hover:text-slate-500 dark:hover:text-white/50 z-10 transition-colors bg-white/60 dark:bg-white/5 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100"
      >
        <svg className="w-4 h-4 outline-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9h8M8 15h8" />
        </svg>
      </div>

      <div className="relative flex flex-col gap-4 p-5 pt-6 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shrink-0"
              style={{ backgroundColor: `${accentColor}18`, borderColor: `${accentColor}30` }}
            >
              {icon || '📚'}
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight">{name}</h3>
              <p className="text-xs text-slate-400 dark:text-white/30 font-medium mt-0.5">
                {completedTopics}/{totalTopics} topics done
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-7 mt-0.5">
            <button
              onClick={() => onEdit(subject)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
              title="Edit subject"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(_id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
              title="Delete subject"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Progress</span>
            <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{averageProgress}%</span>
          </div>
          <ProgressBar value={averageProgress} color={accentColor} size="md" />
        </div>

        {/* Exam countdown */}
        <CountdownTimer examDate={examDate} />

        {/* Warning banner */}
        {isBehindSchedule && (
          <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-bold text-red-600 dark:text-red-400">
              {isOverdue ? 'Exam passed — incomplete!' : 'Behind schedule!'}
            </span>
          </div>
        )}

        {/* View link */}
        <Link
          to={`/subjects/${_id}`}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black text-slate-500 dark:text-white/30 hover:text-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-violet-600 border transition-all duration-300 uppercase tracking-wider"
          style={{ borderColor: 'var(--card-border)' }}
        >
          View Topics
          <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
