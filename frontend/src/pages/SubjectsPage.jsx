import { useEffect, useState } from 'react';
import api from '../services/api';
import SubjectCard from '../components/SubjectCard';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { format } from 'date-fns';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];
const ICONS  = ['📚','🔬','🧮','🏛️','🌍','💻','🎨','🎵','⚗️','📐','🧬','📖'];

const defaultForm = { name: '', description: '', color: COLORS[0], examDate: '', icon: ICONS[0] };

const SORT_OPTIONS = [
  { value: 'custom',   label: 'Custom Order' },
  { value: 'newest',  label: 'Newest First' },
  { value: 'name',    label: 'Alphabetical' },
  { value: 'progress',label: 'Highest Progress' },
  { value: 'exam',    label: 'Nearest Exam' },
];

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(defaultForm);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId]   = useState(null);
  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState('custom');

  const isDark = user?.darkMode;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSubjects((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setSortBy('custom');
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/api/subjects');
      setSubjects(res.data.data);
    } catch {
      setError('Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setForm({
      name:        subject.name,
      description: subject.description || '',
      color:       subject.color || COLORS[0],
      examDate:    subject.examDate ? format(new Date(subject.examDate), "yyyy-MM-dd'T'HH:mm") : '',
      icon:        subject.icon || ICONS[0],
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Subject name is required');
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await api.put(`/api/subjects/${editing._id}`, form);
      } else {
        await api.post('/api/subjects', form);
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/subjects/${deleteId}`);
      setSubjects((prev) => prev.filter((s) => s._id !== deleteId));
      toast.success('Subject deleted successfully');
    } catch {
      toast.error('Failed to delete subject.');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredAndSorted = subjects
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'custom')   return 0;
      if (sortBy === 'name')     return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return b.averageProgress - a.averageProgress;
      if (sortBy === 'exam') {
        if (!a.examDate) return 1;
        if (!b.examDate) return -1;
        return new Date(a.examDate) - new Date(b.examDate);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="space-y-8 pb-10">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-2"
      >
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-2">
            Academic Library
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            My{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-violet-400">
              Subjects
            </span>
          </h1>
          <p className="text-slate-500 dark:text-white/40 font-medium mt-1">
            {subjects.length} course{subjects.length !== 1 ? 's' : ''} in your curriculum
          </p>
        </div>
        <motion.button
          id="add-subject-btn"
          onClick={openCreate}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary self-start sm:self-auto shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Subject
        </motion.button>
      </motion.div>

      {/* ── Toolbar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex flex-col md:flex-row items-center gap-3"
      >
        {/* Search */}
        <div className="relative flex-1 w-full">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-11"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <span className="text-xs font-black text-slate-400 dark:text-white/30 whitespace-nowrap uppercase tracking-widest hidden sm:inline">Sort:</span>
          <div className="relative w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field !py-2.5 text-sm w-full appearance-none pr-10 cursor-pointer"
              style={{ background: 'var(--card-bg)' }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* ── Content ── */}
      {loading ? (
        <SkeletonTheme baseColor={isDark ? '#1a2035' : '#e8ecf4'} highlightColor={isDark ? '#243050' : '#f0f4fb'}>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} height={220} borderRadius={20} />)}
          </div>
        </SkeletonTheme>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-10 text-red-500 text-center font-bold border"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          {error}
        </motion.div>
      ) : subjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border-2 border-dashed flex flex-col items-center py-20 text-center gap-4"
          style={{ borderColor: 'var(--card-border)', background: 'var(--card-bg)' }}
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 flex items-center justify-center text-4xl animate-float border border-primary-500/10">
            📚
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Ready to build your curriculum?</h2>
            <p className="text-slate-400 dark:text-white/30 text-sm max-w-xs mx-auto">
              Add your first subject to start tracking progress and stay ahead of every exam date.
            </p>
          </div>
          <motion.button
            onClick={openCreate}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="btn-primary mt-2"
          >
            Add First Subject
          </motion.button>
        </motion.div>
      ) : filteredAndSorted.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <p className="text-slate-400 dark:text-white/30 font-bold">No subjects match your search.</p>
        </motion.div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredAndSorted.map(s => s._id)} strategy={rectSortingStrategy}>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence>
                {filteredAndSorted.map((subject, idx) => (
                  <motion.div
                    key={subject._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                  >
                    <SubjectCard
                      subject={subject}
                      onEdit={openEdit}
                      onDelete={(id) => setDeleteId(id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Subject' : 'New Subject'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          {formError && (
            <motion.p
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 font-semibold"
            >
              {formError}
            </motion.p>
          )}

          {/* Icon picker */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-3">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => setForm({ ...form, icon })}
                  className={`text-xl p-2.5 rounded-xl border-2 transition-all duration-200 ${
                    form.icon === icon
                      ? 'border-primary-500 bg-primary-500/10 scale-110'
                      : 'border-slate-200 dark:border-white/10 hover:border-primary-400 hover:scale-105'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Subject Name *</label>
            <input
              id="subject-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Mathematics"
              className="input-field"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional notes about this subject..."
              rows={2}
              className="input-field resize-none py-3"
            />
          </div>

          {/* Exam date */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Exam Date & Time</label>
            <input
              id="subject-exam-date"
              type="datetime-local"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-3">Accent Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-9 h-9 rounded-xl border-4 transition-all duration-200 hover:scale-110 ${
                    form.color === c ? 'border-slate-900 dark:border-white scale-110 shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button id="subject-save-btn" type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </span>
              ) : editing ? 'Save Changes' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Subject">
        <div className="space-y-5">
          <p className="text-slate-600 dark:text-white/60 leading-relaxed">
            Are you sure you want to delete this subject and <span className="font-bold text-slate-900 dark:text-white">all its topics</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger flex-1">Delete Subject</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
