import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import CountdownTimer from './CountdownTimer';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Card displaying subject summary: name, icon, progress, exam countdown, warning badge.
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
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`card group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden animate-slide-up ${isDragging ? 'shadow-2xl ring-2 ring-primary-500 scale-105' : ''}`}
    >
      {/* Colored top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: color || '#6366f1' }} />

      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-3 right-3 p-1.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10 transition-colors bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100"
      >
        <svg className="w-5 h-5 outline-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9h8M8 15h8" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between pt-1">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon || '📚'}</span>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {completedTopics}/{totalTopics} topics done
            </p>
          </div>
        </div>

        {/* Actions - shifted to avoid drag handle */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-10 mt-1">
          <button
            onClick={() => onEdit(subject)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
            title="Edit subject"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(_id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Delete subject"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Progress</span>
          <span className="font-bold text-gray-900 dark:text-white">{averageProgress}%</span>
        </div>
        <ProgressBar value={averageProgress} color={color} size="md" />
      </div>

      {/* Exam countdown */}
      <CountdownTimer examDate={examDate} />

      {/* Warning banner */}
      {isBehindSchedule && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-3 py-2">
          <span>⚠️</span>
          <span className="text-xs font-semibold text-red-700 dark:text-red-400">
            {isOverdue ? 'Exam passed – incomplete!' : 'Behind schedule!'}
          </span>
        </div>
      )}

      {/* View details link */}
      <Link
        to={`/subjects/${_id}`}
        className="btn-primary text-center text-sm mt-auto"
      >
        View Topics →
      </Link>
    </div>
  );
}
