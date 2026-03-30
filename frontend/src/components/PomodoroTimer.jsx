import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import StudySessionService from '../services/studySessionService';

const MODES = [
  { key: 'focus',   label: 'Focus',       minutes: 25, color: '#6366f1' },
  { key: 'short',   label: 'Short Break', minutes: 5,  color: '#10b981' },
  { key: 'long',    label: 'Long Break',  minutes: 15, color: '#f59e0b' },
];

export default function PomodoroTimer() {
  const [modeIdx, setModeIdx]   = useState(0);
  const [seconds, setSeconds]   = useState(MODES[0].minutes * 60);
  const [running, setRunning]   = useState(false);
  const [sessions, setSessions] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const mode = MODES[modeIdx];

  // Fetch subjects for select dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/api/subjects');
        setSubjects(res.data.data || []);
      } catch {}
    };
    fetchSubjects();
  }, []);

  const reset = useCallback((idx = modeIdx) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(MODES[idx].minutes * 60);
    startTimeRef.current = null;
  }, [modeIdx]);

  useEffect(() => {
    if (running) {
      if (!startTimeRef.current && MODES[modeIdx].key === 'focus') {
        startTimeRef.current = new Date();
      }
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);

            // Log session if focus was completed
            if (MODES[modeIdx].key === 'focus') {
              setSessions((prev) => prev + 1);
              const endTime = new Date();
              const duration = MODES[modeIdx].minutes;
              const startTime = startTimeRef.current || new Date(endTime.getTime() - duration * 60 * 1000);

              StudySessionService.create({
                subject: selectedSubject || null,
                duration,
                startTime,
                endTime,
                type: 'FOCUS'
              }).catch(() => console.error("Failed to log session"));

              startTimeRef.current = null;
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, modeIdx, selectedSubject]);

  const switchMode = (idx) => {
    setModeIdx(idx);
    reset(idx);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const totalSecs = mode.minutes * 60;
  const progress = ((totalSecs - seconds) / totalSecs) * 100;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="card flex flex-col items-center gap-5">
      <h3 className="font-bold text-gray-900 dark:text-white text-base self-start">🍅 Pomodoro Timer</h3>

      {/* Subject select */}
      <div className="w-full">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="input !py-1.5 text-xs bg-gray-50 dark:bg-gray-800"
        >
          <option value="">(Select Subject)</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
          ))}
        </select>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {MODES.map((m, i) => (
          <button
            key={m.key}
            onClick={() => switchMode(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              modeIdx === i
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Circular SVG timer */}
      <div className="relative flex items-center justify-center">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-gray-700" />
          <circle
            cx="64" cy="64" r="54"
            fill="none"
            stroke={mode.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * progress) / 100}
            transform="rotate(-90 64 64)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">{mm}:{ss}</span>
          <span className="text-xs text-gray-400">{mode.label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setRunning(!running)}
          className="btn-primary px-6"
          style={{ backgroundColor: mode.color }}
        >
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button onClick={() => reset()} className="btn-secondary px-4">↺ Reset</button>
      </div>

      {/* Session count */}
      <p className="text-xs text-gray-400">
        🍅 <span className="font-semibold text-gray-600 dark:text-gray-300">{sessions}</span> sessions completed today
      </p>
    </div>
  );
}
