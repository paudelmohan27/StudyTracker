import { useEffect, useState } from 'react';
import api from '../services/api';
import SubjectCard from '../components/SubjectCard';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];
const ICONS  = ['📚','🔬','🧮','🏛️','🌍','💻','🎨','🎵','⚗️','📐','🧬','📖'];

const defaultForm = { name: '', description: '', color: COLORS[0], examDate: '', icon: ICONS[0] };

export default function SubjectsPage() {
  const [subjects, setSubjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(defaultForm);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId]   = useState(null);

  // Search and Sort states
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('custom'); // 'custom', 'newest', 'name', 'progress', 'exam'

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
      // Force custom sort when user drags to prevent snapbacks
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
      examDate:    subject.examDate ? subject.examDate.split('T')[0] : '',
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

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const filteredAndSorted = subjects
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'custom') return 0; // maintain drag order base
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return b.averageProgress - a.averageProgress;
      if (sortBy === 'exam') {
        if (!a.examDate) return 1;
        if (!b.examDate) return -1;
        return new Date(a.examDate) - new Date(b.examDate);
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subjects</h1>
          <p className="text-sm text-gray-400 mt-0.5">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <button id="add-subject-btn" onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <span>+</span> Add Subject
        </button>
      </div>

      {/* Toolbar: Search & Sort */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !pl-10 text-sm"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-gray-400 whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input !py-1.5 text-xs w-full sm:w-40 bg-white dark:bg-gray-900"
          >
            <option value="custom">Custom Order</option>
            <option value="newest">Newest First</option>
            <option value="name">Alphabetical</option>
            <option value="progress">Highest Progress</option>
            <option value="exam">Nearest Exam</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="card text-red-500">{error}</div>
      ) : subjects.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center gap-4">
          <span className="text-7xl">📚</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">No subjects yet</h2>
          <p className="text-gray-400 text-sm max-w-xs">Add your first subject to start tracking your study progress and exam readiness.</p>
          <button onClick={openCreate} className="btn-primary mt-2">Add your first subject</button>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          No subjects match your search.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredAndSorted.map(s => s._id)} strategy={rectSortingStrategy}>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredAndSorted.map((subject) => (
                <SubjectCard key={subject._id} subject={subject} onEdit={openEdit} onDelete={handleDeleteClick} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
              {formError}
            </p>
          )}

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => setForm({ ...form, icon })}
                  className={`text-xl p-2 rounded-xl border-2 transition ${
                    form.icon === icon
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject Name *</label>
            <input
              id="subject-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Mathematics"
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional notes about this subject..."
              rows={2}
              className="input resize-none"
            />
          </div>

          {/* Exam date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Exam Date</label>
            <input
              id="subject-exam-date"
              type="date"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="input"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-xl border-4 transition ${form.color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button id="subject-save-btn" type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Subject">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this subject and all its topics? This action cannot be undone.
          </p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger flex-1">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
