'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

type Task = {
  id: string;
  title: string;
  description?: string;
  column: 'todo' | 'inprogress' | 'done';
  createdAt: string;
  createdBy: string;
};

type Column = {
  id: 'todo' | 'inprogress' | 'done';
  title: string;
  color: string;
};

const columns: Column[] = [
  { id: 'todo', title: '📋 To Do', color: 'bg-blue-500' },
  { id: 'inprogress', title: '🚀 In Progress', color: 'bg-yellow-500' },
  { id: 'done', title: '✅ Done', color: 'bg-green-500' },
];

export default function Home() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lumen-tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('lumen-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || undefined,
      column: 'todo',
      createdAt: new Date().toISOString(),
      createdBy: session?.user?.name || 'Anonymous',
    };
    
    setTasks([...tasks, task]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddModal(false);
  };

  const moveTask = (taskId: string, newColumn: 'todo' | 'inprogress' | 'done') => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, column: newColumn } : t
    ));
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Delete this task?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const updateTask = (task: Task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
    setEditingTask(null);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: 'todo' | 'inprogress' | 'done') => {
    if (draggedTask) {
      moveTask(draggedTask.id, columnId);
      setDraggedTask(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <h1 className="text-2xl font-bold text-white">Lumen Tasks</h1>
            <span className="text-sm text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
              Ben + Lumen
            </span>
          </div>
          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <span className="text-white/50">Loading...</span>
            ) : session ? (
              <>
                <div className="flex items-center gap-2">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ''}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-white/70 text-sm hidden sm:inline">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-white/50 hover:text-white text-sm transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <span>🔐</span> Sign in with Google
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <span>+</span> Add Task
            </button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <div
              key={column.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className={`${column.color} px-4 py-3`}>
                <h2 className="font-semibold text-white text-lg">
                  {column.title}
                  <span className="ml-2 text-white/70 text-sm">
                    ({tasks.filter(t => t.column === column.id).length})
                  </span>
                </h2>
              </div>

              {/* Tasks */}
              <div className="p-3 space-y-3 min-h-[300px]">
                {tasks
                  .filter(t => t.column === column.id)
                  .map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className="bg-white/10 hover:bg-white/15 rounded-lg p-4 cursor-grab active:cursor-grabbing border border-white/5 hover:border-white/20 transition-all group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-white">{task.title}</h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="text-white/50 hover:text-white p-1"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-white/50 hover:text-red-400 p-1"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-white/60 text-sm mt-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
                        <span>{task.createdBy}</span>
                        <span>•</span>
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                
                {tasks.filter(t => t.column === column.id).length === 0 && (
                  <div className="text-center text-white/30 py-8">
                    <p>No tasks yet</p>
                    <p className="text-sm mt-1">Drag tasks here or add new ones</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Add New Task</h2>
            <input
              type="text"
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 mb-3"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)..."
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 mb-4 h-24 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Edit Task</h2>
            <input
              type="text"
              placeholder="Task title..."
              value={editingTask.title}
              onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 mb-3"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)..."
              value={editingTask.description || ''}
              onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 mb-4 h-24 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateTask(editingTask)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10 py-2">
        <p className="text-center text-white/40 text-sm">
          ✨ Built by Lumen for Ben & Lumen collaboration
        </p>
      </footer>
    </div>
  );
}
