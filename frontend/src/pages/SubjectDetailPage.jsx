import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import CountdownTimer from '../components/CountdownTimer';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
const STATUS_LABELS  = { NOT_STARTED: 'Not Started', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };

const STATUS_STYLES = {
  NOT_STARTED: 'text-slate-500 dark:text-white/30 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10',
  IN_PROGRESS: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
  COMPLETED:   'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
};

const defaultTopicForm = { title: '', description: '', status: 'NOT_STARTED', progress: 0 };

// ── Topic Row ────────────────────────────────────────────────────────────────
function TopicRow({ topic, onEdit, onDelete, onCycle, idx }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.4 }}
      className="group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'var(--page-bg)', borderColor: 'var(--card-border)' }}
    >
      {/* Status toggle */}
      <button
        onClick={() => onCycle(topic)}
        title="Click to cycle status"
        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          topic.status === 'COMPLETED'
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30'
            : topic.status === 'IN_PROGRESS'
            ? 'border-amber-400 text-amber-400 bg-amber-400/10'
            : 'border-slate-300 dark:border-white/20 hover:border-primary-400'
        }`}
      >
        {topic.status === 'COMPLETED' && (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {topic.status === 'IN_PROGRESS' && <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className={`text-sm font-bold text-slate-900 dark:text-white truncate transition-all ${
            topic.status === 'COMPLETED' ? 'line-through opacity-50' : ''
          }`}>
            {topic.title}
          </p>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[topic.status]}`}>
            {STATUS_LABELS[topic.status]}
          </span>
        </div>
        {topic.description && (
          <p className="text-xs text-slate-400 dark:text-white/30 mb-2 truncate">{topic.description}</p>
        )}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={topic.progress} size="sm" />
          </div>
          <span className="text-xs font-black text-slate-500 dark:text-white/40 shrink-0 tabular-nums w-8 text-right">
            {topic.progress}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(topic)}
          className="p-2 rounded-xl text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
          title="Edit topic"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(topic._id)}
          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
          title="Delete topic"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SubjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [subject, setSubject]     = useState(null);
  const [topics, setTopics]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [form, setForm]           = useState(defaultTopicForm);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId]   = useState(null);
  const [filter, setFilter]       = useState('all');

  const isDark = user?.darkMode;

  const fetchSubject = async () => {
    try {
      const res = await api.get(`/api/subjects/${id}`);
      const { topics: t, ...subj } = res.data.data;
      setSubject(subj);
      setTopics(t || []);
    } catch {
      setError('Subject not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubject(); }, [id]);

  const openCreate = () => {
    setEditingTopic(null);
    setForm(defaultTopicForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (topic) => {
    setEditingTopic(topic);
    setForm({ title: topic.title, description: topic.description || '', status: topic.status, progress: topic.progress });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError('Title is required');
    setSaving(true);
    try {
      if (editingTopic) {
        const res = await api.put(`/api/topics/${editingTopic._id}`, form);
        setTopics((prev) => prev.map((t) => t._id === editingTopic._id ? res.data.data : t));
      } else {
        const res = await api.post(`/api/subjects/${id}/topics`, form);
        setTopics((prev) => [...prev, res.data.data]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save topic');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/topics/${deleteId}`);
      setTopics((prev) => prev.filter((t) => t._id !== deleteId));
      toast.success('Topic deleted');
    } catch {
      toast.error('Failed to delete topic.');
    } finally {
      setDeleteId(null);
    }
  };

  const cycleStatus = async (topic) => {
    const idx = STATUS_OPTIONS.indexOf(topic.status);
    const nextStatus = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
    const nextProgress = nextStatus === 'COMPLETED' ? 100 : nextStatus === 'NOT_STARTED' ? 0 : topic.progress || 50;
    try {
      const res = await api.put(`/api/topics/${topic._id}`, { status: nextStatus, progress: nextProgress });
      setTopics((prev) => prev.map((t) => t._id === topic._id ? res.data.data : t));
    } catch {}
  };

  const totalTopics     = topics.length;
  const completedTopics = topics.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTopics = topics.filter((t) => t.status === 'IN_PROGRESS').length;
  const avgProgress     = totalTopics > 0 ? Math.round(topics.reduce((s, t) => s + t.progress, 0) / totalTopics) : 0;

  const filteredTopics = topics.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  if (loading) return (
    <SkeletonTheme baseColor={isDark ? '#1a2035' : '#e8ecf4'} highlightColor={isDark ? '#243050' : '#f0f4fb'}>
      <div className="space-y-6">
        <Skeleton height={28} width={200} borderRadius={8} />
        <Skeleton height={160} borderRadius={20} />
        <Skeleton height={400} borderRadius={20} />
      </div>
    </SkeletonTheme>
  );

  if (error) return (
    <div className="rounded-2xl p-10 text-red-500 text-center font-bold border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      {error}
      <Link to="/subjects" className="text-primary-500 ml-3 hover:underline">← Back to Subjects</Link>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">

      {/* ── Breadcrumb ── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm"
      >
        <Link to="/subjects" className="flex items-center gap-1.5 text-slate-400 dark:text-white/30 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Subjects
        </Link>
        <svg className="w-4 h-4 text-slate-300 dark:text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-black text-slate-900 dark:text-white">{subject.name}</span>
      </motion.div>

      {/* ── Subject Hero Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border relative overflow-hidden p-6"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        {/* Colored accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: subject.color }} />
        {/* Subtle glow */}
        <div className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none rounded-t-2xl" style={{ background: `linear-gradient(to bottom, ${subject.color}, transparent)` }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border" style={{ backgroundColor: `${subject.color}20`, borderColor: `${subject.color}30` }}>
              {subject.icon}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{subject.name}</h1>
              {subject.description && <p className="text-sm text-slate-400 dark:text-white/40 mt-0.5 font-medium">{subject.description}</p>}
              <div className="mt-2">
                <CountdownTimer examDate={subject.examDate} />
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{avgProgress}<span className="text-xl text-slate-400 dark:text-white/30">%</span></p>
            <p className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest mt-1">{completedTopics}/{totalTopics} completed</p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <ProgressBar value={avgProgress} color={subject.color} size="lg" showLabel={false} />
          {subject.examDate && (
            <p className="text-xs font-bold text-slate-400 dark:text-white/30 mt-3">
              📅 Exam: {format(new Date(subject.examDate), "EEEE, d MMMM yyyy 'at' h:mm a")}
            </p>
          )}
        </div>

        {/* Stat pills */}
        <div className="flex gap-3 mt-5 flex-wrap">
          {[
            { label: 'Total Topics', value: totalTopics, color: 'text-slate-600 dark:text-white/60 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10' },
            { label: 'In Progress', value: inProgressTopics, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { label: 'Completed', value: completedTopics, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          ].map(stat => (
            <div key={stat.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black ${stat.color}`}>
              <span className="text-base font-black tabular-nums">{stat.value}</span>
              <span className="font-bold opacity-70">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Topics Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="rounded-2xl border p-6"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Topics</h2>
            <p className="text-sm text-slate-400 dark:text-white/30 font-medium mt-0.5">{totalTopics} topic{totalTopics !== 1 ? 's' : ''} in syllabus</p>
          </div>
          <motion.button
            id="add-topic-btn"
            onClick={openCreate}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="btn-primary text-sm self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Topic
          </motion.button>
        </div>

        {/* Filter tabs */}
        {totalTopics > 0 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            {[
              { key: 'all', label: 'All' },
              { key: 'NOT_STARTED', label: 'Not Started' },
              { key: 'IN_PROGRESS', label: 'In Progress' },
              { key: 'COMPLETED', label: 'Completed' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-primary-500/10 border-primary-500/30 text-primary-600 dark:text-primary-400'
                    : 'text-slate-500 dark:text-white/30 border-transparent hover:border-slate-200 dark:hover:border-white/10'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-60">{
                  tab.key === 'all' ? totalTopics : topics.filter(t => t.status === tab.key).length
                }</span>
              </button>
            ))}
          </div>
        )}

        {/* Topics list */}
        {topics.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500/15 to-violet-500/15 flex items-center justify-center text-3xl mb-4 animate-float">
              📝
            </div>
            <p className="font-black text-slate-900 dark:text-white mb-1">No topics yet</p>
            <p className="text-sm text-slate-400 dark:text-white/30 max-w-xs mx-auto mb-5">
              Add topics to break your syllabus into manageable chunks.
            </p>
            <motion.button onClick={openCreate} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary">
              Add First Topic
            </motion.button>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-white/30 font-bold">
            No topics in this category.
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTopics.map((topic, idx) => (
                <TopicRow
                  key={topic._id}
                  topic={topic}
                  idx={idx}
                  onEdit={openEdit}
                  onDelete={(topicId) => setDeleteId(topicId)}
                  onCycle={cycleStatus}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* ── Topic Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTopic ? 'Edit Topic' : 'Add Topic'}>
        <form onSubmit={handleSave} className="space-y-5">
          {formError && (
            <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 font-semibold"
            >
              {formError}
            </motion.p>
          )}

          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Title *</label>
            <input
              id="topic-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Derivatives and Integrals"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional notes..."
              rows={2}
              className="input-field resize-none py-3"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Status</label>
            <select
              id="topic-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input-field !py-3 cursor-pointer"
              style={{ background: 'var(--card-bg)' }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-3">
              Progress — <span className="text-primary-500">{form.progress}%</span>
            </label>
            <div className="relative">
              <input
                id="topic-progress"
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                className="w-full accent-primary-600 h-2 rounded-full cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-white/20 mt-1.5 uppercase tracking-widest">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button id="topic-save-btn" type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </span>
              ) : editingTopic ? 'Save Changes' : 'Add Topic'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Topic">
        <div className="space-y-5">
          <p className="text-slate-600 dark:text-white/60 leading-relaxed">
            Are you sure you want to delete this topic? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger flex-1">Delete Topic</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
