import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';
import CountdownTimer from '../components/CountdownTimer';
import PomodoroTimer from '../components/PomodoroTimer';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import StudySessionService from '../services/studySessionService';

// ── Animated Counter ───────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started || typeof value !== 'number') return;
    let start = null;
    const duration = 1400;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, value]);

  return <span ref={ref}>{typeof value === 'number' ? display : value}{suffix}</span>;
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, suffix, icon, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl p-5 overflow-hidden cursor-default border"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      {/* Gradient sheen overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.04] group-hover:opacity-[0.09] transition-opacity duration-500`} />
      
      <div className="relative flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      <div className="relative">
        <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
          <AnimatedNumber value={value} suffix={suffix} />
        </p>
      </div>
    </motion.div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Card({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border p-6 ${className}`}
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      {children}
    </motion.div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [studyStats, setStudyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, statsRes] = await Promise.all([
          api.get('/api/dashboard/summary'),
          StudySessionService.getStats()
        ]);
        setData(dashRes.data.data);
        setStudyStats(statsRes.data.data || []);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <SkeletonTheme baseColor={user?.darkMode ? '#1a2035' : '#e8ecf4'} highlightColor={user?.darkMode ? '#243050' : '#f0f4fb'}>
      <div className="space-y-8 pt-6">
        <div className="flex flex-col gap-2"><Skeleton height={38} width={340} borderRadius={12} /><Skeleton height={20} width={200} borderRadius={8} /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <Skeleton key={i} height={110} borderRadius={20} />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6"><Skeleton height={300} borderRadius={20} /><Skeleton height={300} borderRadius={20} /></div>
          <div className="space-y-6"><Skeleton height={360} borderRadius={20} /><Skeleton height={180} borderRadius={20} /></div>
        </div>
      </div>
    </SkeletonTheme>
  );

  if (error) return (
    <div className="rounded-2xl p-10 text-red-500 text-center font-bold border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>{error}</div>
  );

  const { overallProgress, totalSubjects, totalTopics, statusCounts, upcomingExams, urgentSubjects, allSubjects } = data;

  const PIE_COLORS = ['#10b981', '#f59e0b', '#6366f1'];
  const pieData = [
    { name: 'Completed',   value: statusCounts.COMPLETED,   color: PIE_COLORS[0] },
    { name: 'In Progress', value: statusCounts.IN_PROGRESS, color: PIE_COLORS[1] },
    { name: 'Not Started', value: statusCounts.NOT_STARTED, color: PIE_COLORS[2] },
  ].filter(d => d.value > 0);

  const isDark = user?.darkMode;
  const chartGridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const chartTickColor = isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8';

  return (
    <div className="space-y-8 pb-10">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-5 pt-2"
      >
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Good {getTimeGreeting()},{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-violet-400">
              {user?.name?.split(' ')[0]}
            </span>{' '}
            <motion.span animate={{ rotate: [0, 15, -10, 15, 0] }} transition={{ delay: 1, duration: 0.6 }} className="inline-block">
              👋
            </motion.span>
          </h1>
          <p className="text-slate-500 dark:text-white/40 font-medium mt-1">Here's your academic progress overview.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link to="/subjects" className="btn-secondary py-2.5 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            Subjects
          </Link>
          <button className="btn-primary py-2.5 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            New Session
          </button>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Overall Progress" value={overallProgress} suffix="%" delay={0.05}
          gradient="from-blue-500 to-indigo-600"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <StatCard label="Active Courses" value={totalSubjects} delay={0.1}
          gradient="from-violet-500 to-fuchsia-600"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
        <StatCard label="Total Topics" value={totalTopics} delay={0.15}
          gradient="from-emerald-500 to-teal-600"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard label="Focus Rank" value="Elite" delay={0.2}
          gradient="from-amber-400 to-orange-500"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Learning Momentum */}
          <Card delay={0.25}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Learning Momentum</h2>
                <p className="text-sm text-slate-400 dark:text-white/30 font-medium mt-0.5">Topic completion distribution</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-500/20">
                LIVE
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-44 h-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={54} outerRadius={78} dataKey="value" paddingAngle={4} stroke="none">
                      {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '14px', border: 'none', background: isDark ? '#1e293b' : '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{overallProgress}%</span>
                  <span className="text-[9px] uppercase font-black text-slate-400 dark:text-white/30 tracking-wider">done</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 flex-1 w-full">
                {pieData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-4">
                    <div className="w-2.5 h-8 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p>
                      <p className="text-xs text-slate-400 dark:text-white/30">{value} topics</p>
                    </div>
                    <span className="text-lg font-black tabular-nums" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex justify-between text-sm font-bold mb-3">
                <span className="text-slate-600 dark:text-white/50">Overall Syllabus Coverage</span>
                <span className="gradient-text">{overallProgress}%</span>
              </div>
              <ProgressBar value={overallProgress} size="lg" showLabel={false} />
            </div>
          </Card>

          {/* Time Analytics */}
          <Card delay={0.3}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Time Analytics</h2>
                <p className="text-sm text-slate-400 dark:text-white/30 font-medium mt-0.5">Study duration — last 7 days</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyStats} barCategoryGap="30%">
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                  <XAxis dataKey="_id" axisLine={false} tickLine={false}
                    tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { weekday: 'short' })}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(99,102,241,0.05)', radius: 8 }}
                    contentStyle={{ borderRadius: '14px', border: 'none', background: isDark ? '#1e293b' : '#fff', boxShadow: '0 15px 40px rgba(0,0,0,0.15)' }}
                    formatter={(v) => [`${v} min`, 'Study Time']}
                  />
                  <Bar dataKey="totalMinutes" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
              {studyStats.length === 0 && (
                <div className="flex flex-col items-center justify-center -mt-52 h-52 gap-3">
                  <p className="text-slate-400 dark:text-white/30 font-bold text-sm">No sessions recorded yet</p>
                  <button className="btn-secondary text-xs py-2">Start First Session</button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Urgent */}
          <AnimatePresence>
            {urgentSubjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="rounded-2xl p-5 border border-red-500/20 bg-red-500/5 dark:bg-red-500/[0.04] relative overflow-hidden"
              >
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 rounded-full bg-red-500">
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                  </div>
                </div>
                <h2 className="text-sm font-black text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Critical Deadlines
                </h2>
                <div className="space-y-3">
                  {urgentSubjects.map(s => (
                    <Link key={s._id} to={`/subjects/${s._id}`}
                      className="group flex items-center justify-between p-3 rounded-xl border border-red-500/10 hover:border-red-500/25 transition-all"
                      style={{ background: 'var(--card-bg)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl group-hover:scale-110 transition-transform">{s.icon}</span>
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{s.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-white/30">{s.averageProgress}% done</p>
                        </div>
                      </div>
                      <CountdownTimer examDate={s.examDate} />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exam Calendar */}
          <Card delay={0.35}>
            <h2 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Exam Calendar
            </h2>
            {upcomingExams.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs font-bold text-slate-400 dark:text-white/30">Clear horizon — no exams soon!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map(s => (
                  <Link key={s._id} to={`/subjects/${s._id}`}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">{s.name}</p>
                      <CountdownTimer examDate={s.examDate} />
                    </div>
                    <svg className="w-3.5 h-3.5 text-slate-300 dark:text-white/20 group-hover:text-primary-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Pomodoro */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <PomodoroTimer />
          </motion.div>
        </div>
      </div>

      {/* ── Course Catalog ── */}
      <Card delay={0.45} className="overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Course Catalog</h2>
            <p className="text-sm text-slate-400 dark:text-white/30 font-medium mt-0.5">Detailed progress per subject</p>
          </div>
          <Link to="/subjects" className="text-xs font-bold text-primary-500 hover:text-primary-400 uppercase tracking-widest transition-colors bg-primary-500/8 hover:bg-primary-500/15 px-4 py-2 rounded-xl">
            View All
          </Link>
        </div>

        {allSubjects.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--card-border)' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 flex items-center justify-center text-3xl animate-float">📚</div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Ready to study?</h3>
            <p className="text-slate-400 dark:text-white/30 text-sm mb-6 max-w-xs mx-auto">Create your first subject to start tracking your learning journey.</p>
            <Link to="/subjects" className="btn-primary inline-flex text-sm px-8">Build Curriculum</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allSubjects.map((s, idx) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.07, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-5 rounded-2xl border transition-all"
                style={{ background: 'var(--page-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/15 to-violet-500/15 flex items-center justify-center text-xl border border-primary-500/10">
                    {s.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-slate-900 dark:text-white truncate text-sm">{s.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color || '#6366f1' }} />
                      <span className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Syllabus</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{s.averageProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.averageProgress}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 + idx * 0.07 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-violet-500"
                    />
                  </div>
                </div>

                <Link to={`/subjects/${s._id}`}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl text-[11px] font-black text-slate-500 dark:text-white/30 hover:text-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-violet-600 border border-transparent hover:border-transparent transition-all duration-300 uppercase tracking-wider"
                  style={{ border: '1px solid var(--card-border)' }}
                >
                  Enter Classroom
                  <svg className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
