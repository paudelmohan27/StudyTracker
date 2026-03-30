import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import CountdownTimer from '../components/CountdownTimer';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
const STATUS_LABELS  = { NOT_STARTED: 'Not Started', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };
const STATUS_BADGE   = { NOT_STARTED: 'badge-not-started', IN_PROGRESS: 'badge-in-progress', COMPLETED: 'badge-completed' };

const defaultTopicForm = { title: '', description: '', status: 'NOT_STARTED', progress: 0 };

export default function SubjectDetailPage() {
  const { id } = useParams();

  const [subject, setSubject]     = useState(null);
  const [topics, setTopics]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [form, setForm]           = useState(defaultTopicForm);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');

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

  const handleDelete = async (topicId) => {
    if (!confirm('Delete this topic?')) return;
    try {
      await api.delete(`/api/topics/${topicId}`);
      setTopics((prev) => prev.filter((t) => t._id !== topicId));
    } catch {
      alert('Failed to delete topic.');
    }
  };

  // Quick status toggle without modal
  const cycleStatus = async (topic) => {
    const idx = STATUS_OPTIONS.indexOf(topic.status);
    const nextStatus = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
    const nextProgress = nextStatus === 'COMPLETED' ? 100 : nextStatus === 'NOT_STARTED' ? 0 : topic.progress || 50;
    try {
      const res = await api.put(`/api/topics/${topic._id}`, { status: nextStatus, progress: nextProgress });
      setTopics((prev) => prev.map((t) => t._id === topic._id ? res.data.data : t));
    } catch {}
  };

  // Derived stats
  const totalTopics     = topics.length;
  const completedTopics = topics.filter((t) => t.status === 'COMPLETED').length;
  const avgProgress     = totalTopics > 0 ? Math.round(topics.reduce((s, t) => s + t.progress, 0) / totalTopics) : 0;

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="card text-red-500">{error} <Link to="/subjects" className="text-primary-500 ml-2">← Back</Link></div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/subjects" className="hover:text-primary-500 transition">Subjects</Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-200 font-medium">{subject.name}</span>
      </div>

      {/* Subject header card */}
      <div className="card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: subject.color }} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{subject.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{subject.name}</h1>
              {subject.description && <p className="text-sm text-gray-400 mt-0.5">{subject.description}</p>}
              <div className="mt-2">
                <CountdownTimer examDate={subject.examDate} />
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgProgress}%</p>
            <p className="text-xs text-gray-400">{completedTopics}/{totalTopics} topics done</p>
          </div>
        </div>
        <div className="mt-5">
          <ProgressBar value={avgProgress} color={subject.color} size="lg" showLabel />
        </div>
        {subject.examDate && (
          <p className="text-xs text-gray-400 mt-2">
            Exam: {format(new Date(subject.examDate), 'EEEE, d MMMM yyyy')}
          </p>
        )}
      </div>

      {/* Topics section */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Topics ({totalTopics})</h2>
          <button id="add-topic-btn" onClick={openCreate} className="btn-primary text-sm flex items-center gap-1.5">
            <span>+</span> Add Topic
          </button>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-5xl block mb-3">📝</span>
            <p className="font-semibold text-gray-600 dark:text-gray-300">No topics yet</p>
            <p className="text-sm mt-1">Add topics to break down your syllabus into manageable chunks.</p>
            <button onClick={openCreate} className="btn-primary mt-4 text-sm">Add first topic</button>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <div
                key={topic._id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition group"
              >
                {/* Status toggle button */}
                <button
                  onClick={() => cycleStatus(topic)}
                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                    topic.status === 'COMPLETED'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : topic.status === 'IN_PROGRESS'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  title="Click to cycle status"
                >
                  {topic.status === 'COMPLETED' && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {topic.status === 'IN_PROGRESS' && <span className="text-xs font-bold">●</span>}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className={`text-sm font-semibold text-gray-900 dark:text-white ${topic.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>
                      {topic.title}
                    </p>
                    <span className={STATUS_BADGE[topic.status]}>{STATUS_LABELS[topic.status]}</span>
                  </div>
                  {topic.description && (
                    <p className="text-xs text-gray-400 mb-2 truncate">{topic.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <ProgressBar value={topic.progress} size="sm" />
                    <span className="text-xs text-gray-400 shrink-0 w-8">{topic.progress}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEdit(topic)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(topic._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topic Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTopic ? 'Edit Topic' : 'Add Topic'}>
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
            <input
              id="topic-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Derivatives and Integrals"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional notes..."
              rows={2}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
            <select
              id="topic-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Progress: <span className="font-bold text-primary-600">{form.progress}%</span>
            </label>
            <input
              id="topic-progress"
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button id="topic-save-btn" type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : editingTopic ? 'Save Changes' : 'Add Topic'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
