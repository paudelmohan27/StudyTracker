import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import StudySessionService from '../services/studySessionService';

const MODES = [
  { key: 'focus',   label: 'Focus',       minutes: 25, color: '#6366f1', icon: '🎯' },
  { key: 'short',   label: 'Short Break', minutes: 5,  color: '#10b981', icon: '☕' },
  { key: 'long',    label: 'Long Break',  minutes: 15, color: '#0ea5e9', icon: '🌊' },
];

export default function PomodoroTimer() {
  const [modeIdx, setModeIdx]   = useState(0);
  const [seconds, setSeconds]   = useState(MODES[0].minutes * 60);
  const [running, setRunning]   = useState(false);
  const [sessions, setSessions] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const workerRef = useRef(null);
  const expectedEndTimeRef = useRef(null);
  const focusStartTimeRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize Web Worker for background-resilient ticking
  useEffect(() => {
    const workerCode = `
      let interval;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (!interval) interval = setInterval(() => self.postMessage('tick'), 500);
        } else if (e.data === 'stop') {
          clearInterval(interval);
          interval = null;
        }
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    workerRef.current = new Worker(url);

    return () => {
      workerRef.current.terminate();
      URL.revokeObjectURL(url);
    };
  }, []);

  const mode = MODES[modeIdx];

  // Fetch subjects
  useEffect(() => {
    api.get('/api/subjects').then((res) => setSubjects(res.data.data || [])).catch(() => {});
  }, []);

  // Request notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playNotification = useCallback(() => {
    // We'll use a standard browser beep if no audio file is available, 
    // but for "premium" feel, we'll try to use a nice sound.
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (err) {
      console.warn("Audio play failed", err);
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Time's up!`, {
        body: mode.key === 'focus' ? 'Focus session complete. Take a break!' : 'Break over. Ready to focus?',
        icon: '/favicon.ico'
      });
    }
  }, [mode.key]);

  const completeSession = useCallback(() => {
    setRunning(false);
    playNotification();

    if (mode.key === 'focus') {
      setSessions((s) => s + 1);
      const endTime = new Date();
      const duration = mode.minutes;
      const startTime = focusStartTimeRef.current || new Date(endTime.getTime() - duration * 60 * 1000);

      StudySessionService.create({
        subject: selectedSubject || null,
        duration,
        startTime,
        endTime,
        type: 'FOCUS'
      }).catch(() => {});
      
      focusStartTimeRef.current = null;

      // Auto-transition to break
      const nextMode = (sessions + 1) % 4 === 0 ? 2 : 1; // Long break every 4 sessions
      setModeIdx(nextMode);
      setSeconds(MODES[nextMode].minutes * 60);
    } else {
      // Transition back to focus
      setModeIdx(0);
      setSeconds(MODES[0].minutes * 60);
    }
  }, [mode.key, mode.minutes, sessions, selectedSubject, playNotification]);

  useEffect(() => {
    if (!workerRef.current || !running) return;

    if (mode.key === 'focus' && !focusStartTimeRef.current) {
      focusStartTimeRef.current = new Date();
    }

    workerRef.current.onmessage = () => {
      const remaining = Math.max(0, Math.round((expectedEndTimeRef.current - Date.now()) / 1000));
      setSeconds(remaining);

      if (remaining <= 0) {
        workerRef.current.postMessage('stop');
        setRunning(false);
        completeSession();
      }
    };

    workerRef.current.postMessage('start');

    return () => workerRef.current?.postMessage('stop');
  }, [running, mode.key, completeSession]);

  // Page Visibility API to sync UI immediately when returning to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && running) {
        const remaining = Math.max(0, Math.round((expectedEndTimeRef.current - Date.now()) / 1000));
        setSeconds(remaining);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [running]);

  const toggleTimer = () => {
    if (!running) {
      expectedEndTimeRef.current = Date.now() + seconds * 1000;
    }
    setRunning(!running);
  };

  const resetTimer = () => {
    setRunning(false);
    setSeconds(mode.minutes * 60);
    focusStartTimeRef.current = null;
    expectedEndTimeRef.current = null;
  };

  const skipMode = () => {
    const nextIdx = (modeIdx + 1) % MODES.length;
    setModeIdx(nextIdx);
    setSeconds(MODES[nextIdx].minutes * 60);
    setRunning(false);
    focusStartTimeRef.current = null;
    expectedEndTimeRef.current = null;
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const progress = ((mode.minutes * 60 - seconds) / (mode.minutes * 60)) * 100;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="card flex flex-col items-center gap-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-50" style={{ backgroundImage: `linear-gradient(to bottom, ${mode.color}, transparent)` }} />
      
      <div className="w-full flex justify-between items-center px-1">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">{mode.icon}</span> Pomodoro
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
          Session #{sessions + 1}
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="flex w-full bg-gray-100 dark:bg-gray-800/50 p-1 rounded-2xl gap-1">
        {MODES.map((m, i) => (
          <button
            key={m.key}
            onClick={() => {
              setModeIdx(i);
              setSeconds(m.minutes * 60);
              setRunning(false);
            }}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all duration-300 ${
              modeIdx === i 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Timer Display */}
      <div className="relative flex items-center justify-center py-2">
        <svg width="140" height="140" viewBox="0 0 128 128" className="transform -rotate-90">
          <circle cx="64" cy="64" r="54" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-100 dark:text-gray-800" />
          <circle
            cx="64" cy="64" r="54"
            fill="none"
            stroke={mode.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * progress) / 100}
            className="transition-all duration-300 ease-linear shadow-lg"
            style={{ filter: `drop-shadow(0 0 4px ${mode.color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tighter tabular-nums mb-[-4px]">
            {mm}:{ss}
          </span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{mode.label}</span>
        </div>
      </div>

      {/* Subject Selection */}
      <div className="w-full space-y-4">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="input !py-2 !text-[11px] font-medium text-gray-600 dark:text-gray-400 border-none shadow-inner bg-gray-50 dark:bg-gray-800/80 focus:ring-1 focus:ring-primary-500/20"
        >
          <option value="">Working on nothing specific</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
          ))}
        </select>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-3 rounded-2xl text-white font-bold text-sm shadow-lg transition-all duration-300 active:scale-95 ${
              running ? 'bg-gray-900 dark:bg-white dark:text-gray-900' : ''
            }`}
            style={{ backgroundColor: running ? undefined : mode.color }}
          >
            {running ? '⏸ PAUSE' : '▶ START'}
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Reset"
            >
              ↺
            </button>
            <button
              onClick={skipMode}
              className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Skip"
            >
              ↠
            </button>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 font-medium tracking-tight">
        ✨ <span className="text-primary-600 dark:text-primary-400 font-bold">{sessions}</span> study blocks completed today
      </p>
    </div>
  );
}
