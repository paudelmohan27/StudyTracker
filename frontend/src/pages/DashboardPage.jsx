import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';
import CountdownTimer from '../components/CountdownTimer';
import PomodoroTimer from '../components/PomodoroTimer';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { motion } from 'framer-motion';
import {
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import StudySessionService from '../services/studySessionService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [studyStats, setStudyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

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
    <SkeletonTheme baseColor={user?.darkMode ? "#1f2937" : "#f3f4f6"} highlightColor={user?.darkMode ? "#374151" : "#f9fafb"}>
      <div className="space-y-6 pt-4">
        <div>
           <Skeleton height={32} width={300} />
           <Skeleton height={20} width={200} className="mt-2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton height={100} borderRadius={16} />
          <Skeleton height={100} borderRadius={16} />
          <Skeleton height={100} borderRadius={16} />
          <Skeleton height={100} borderRadius={16} />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <Skeleton height={300} borderRadius={16} />
              <Skeleton height={350} borderRadius={16} />
           </div>
           <div className="space-y-6">
              <Skeleton height={400} borderRadius={16} />
           </div>
        </div>
      </div>
    </SkeletonTheme>
  );

  if (error) return (
    <div className="card text-red-500">{error}</div>
  );

  const { overallProgress, totalSubjects, totalTopics, statusCounts, upcomingExams, urgentSubjects, allSubjects } = data;

  const pieData = [
    { name: 'Completed',   value: statusCounts.COMPLETED,   color: '#10b981' },
    { name: 'In Progress', value: statusCounts.IN_PROGRESS, color: '#f59e0b' },
    { name: 'Not Started', value: statusCounts.NOT_STARTED, color: '#6b7280' },
  ].filter((d) => d.value > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {getTimeGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here's your study progress overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Progress', value: `${overallProgress}%`, icon: '📈', color: 'primary' },
          { label: 'Subjects',         value: totalSubjects,         icon: '📚', color: 'blue'    },
          { label: 'Total Topics',     value: totalTopics,           icon: '📝', color: 'violet'  },
          { label: 'Urgent Subjects',  value: urgentSubjects.length, icon: '⚠️', color: 'red'     },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card flex items-center gap-4">
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Overall progress bar + pie chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress breakdown */}
          <div className="card">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Overall Progress</h2>
            <div className="flex items-center gap-3 mb-4">
              <ProgressBar value={overallProgress} size="lg" showLabel />
              <span className="text-lg font-bold text-gray-900 dark:text-white w-12 shrink-0">{overallProgress}%</span>
            </div>

            {totalTopics > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} topics`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {[
                    { label: 'Completed',   value: statusCounts.COMPLETED,   color: '#10b981' },
                    { label: 'In Progress', value: statusCounts.IN_PROGRESS, color: '#f59e0b' },
                    { label: 'Not Started', value: statusCounts.NOT_STARTED, color: '#6b7280' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
                      <span className="text-gray-600 dark:text-gray-400">{label}:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Urgent / behind schedule */}
          {urgentSubjects.length > 0 && (
            <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
              <h2 className="font-bold text-red-700 dark:text-red-400 mb-3">⚠️ Behind Schedule</h2>
              <div className="space-y-3">
                {urgentSubjects.map((s) => (
                  <Link
                    key={s._id}
                    to={`/subjects/${s._id}`}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-800 hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.averageProgress}% complete</p>
                      </div>
                    </div>
                    <CountdownTimer examDate={s.examDate} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Study hours chart */}
          <div className="card">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Study Time (Last 7 Days)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val) => [`${val} min`, 'Duration']}
                  />
                  <Bar dataKey="totalMinutes" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {studyStats.length === 0 && (
              <p className="text-center text-sm text-gray-400 -mt-32 pb-32">No study sessions logged yet.</p>
            )}
          </div>

          {/* All subjects progress list */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">All Subjects</h2>
              <Link to="/subjects" className="text-sm text-primary-600 dark:text-primary-400 font-semibold hover:underline">View all →</Link>
            </div>
            {allSubjects.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 mt-4">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-3xl">📚</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Your dashboard is looking a bit empty!</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto mb-4">Start tracking your classes, syllabus topics, and exam dates to see your progress bloom.</p>
                <Link to="/subjects" className="btn-primary text-sm inline-flex">Create First Subject</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {allSubjects.map((s) => (
                  <div key={s._id} className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900 dark:text-white truncate">{s.name}</span>
                        <span className="text-gray-400 shrink-0 ml-2">{s.averageProgress}%</span>
                      </div>
                      <ProgressBar value={s.averageProgress} color={s.color} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming exams */}
          <div className="card">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">📅 Upcoming Exams</h2>
            {upcomingExams.length === 0 ? (
              <p className="text-sm text-gray-400">No exams in the next 30 days.</p>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map((s) => (
                  <Link
                    key={s._id}
                    to={`/subjects/${s._id}`}
                    className="block p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span>{s.icon}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</span>
                    </div>
                    <CountdownTimer examDate={s.examDate} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pomodoro */}
          <PomodoroTimer />
        </div>
      </div>
    </motion.div>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
