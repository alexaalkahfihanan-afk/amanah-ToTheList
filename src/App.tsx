import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, CheckCircle2, ListTodo, MoreVertical, LayoutGrid, List, PieChart as PieChartIcon, Plus } from "lucide-react";
import { Todo, Priority, INITIAL_CATEGORIES, PRIORITIES } from "./types";
import TaskInput from "./components/TaskInput";
import TaskItem from "./components/TaskItem";
import Pomodoro from "./components/Pomodoro";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "./lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const LOCAL_STORAGE_KEY = "amanah_todo_list";
const CATEGORIES_STORAGE_KEY = "amanah_categories";

type FilterType = "all" | "active" | "completed";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const addTodo = (text: string, priority: Priority, category: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
    };
    setTodos([newTodo, ...todos]);
  };

  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim().toLowerCase();
    if (name && !categories.includes(name)) {
      setCategories([...categories, name]);
      setNewCategoryName("");
      setShowAddCategory(false);
    }
  };

  const addSubtasks = (parentId: string, texts: string[]) => {
    const parent = todos.find(t => t.id === parentId);
    if (!parent) return;

    const newSubTodos = texts.map(text => ({
      id: crypto.randomUUID(),
      text: `[${parent.text}] - ${text}`,
      completed: false,
      priority: parent.priority,
      category: parent.category,
      createdAt: Date.now(),
    }));

    setTodos([...newSubTodos, ...todos]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const filteredTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        const matchesFilter =
          filter === "all" || (filter === "active" ? !todo.completed : todo.completed);
        const matchesCategory = categoryFilter === "all" || todo.category === categoryFilter;
        const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [todos, filter, categoryFilter, searchQuery]);

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
  };

  const chartData = [
    { name: "Selesai", value: stats.completed, color: "#FFFFFF" },
    { name: "Aktif", value: stats.active, color: "#EB5E28" },
  ];

  return (
    <div className="min-h-screen bg-[#0F1113] text-[#F9F9F9] font-sans flex overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col w-80 border-r border-[#2A2D31] transition-all duration-300",
          !isSidebarOpen && "w-20"
        )}
      >
        <div className="pt-12 px-8 flex items-center justify-between mb-8 flex-shrink-0">
          <div className={cn("flex flex-col", !isSidebarOpen && "hidden")}>
             <span className="mono-label">Sistem</span>
             <h1 className="text-2xl font-black">AMANAH</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#2A2D31] rounded transition-colors"
          >
            <LayoutGrid size={20} className="text-[#6A6D71]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 space-y-10 custom-scrollbar">
          <div className="space-y-8">
            <SidebarItem
              index="01"
              label="KOTAK MASUK"
              active={categoryFilter === "all"}
              onClick={() => setCategoryFilter("all")}
              collapsed={!isSidebarOpen}
            />
            
            <div className={cn("space-y-4 pt-4 border-t border-[#2A2D31]", !isSidebarOpen && "hidden")}>
                <div className="flex items-center justify-between">
                  <p className="mono-label">KATEGORI</p>
                  <button 
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    className="p-1 hover:bg-[#2A2D31] rounded transition-colors text-[#6A6D71] hover:text-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {showAddCategory && (
                  <form onSubmit={addCategory} className="mb-4">
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Nama kategori..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-[#151719] border border-[#2A2D31] p-2 text-xs font-bold uppercase rounded outline-none focus:border-accent"
                    />
                  </form>
                )}

                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {categories.map((cat, idx) => (
                    <SidebarItem
                      key={cat}
                      index={`0${idx + 2}`}
                      label={cat.toUpperCase()}
                      active={categoryFilter === cat}
                      onClick={() => setCategoryFilter(cat)}
                      collapsed={!isSidebarOpen}
                      small
                    />
                  ))}
                </div>
            </div>

            <div className={cn("pt-4 border-t border-[#2A2D31]", !isSidebarOpen && "hidden")}>
              <p className="mono-label mb-4">FOCUS TIMER</p>
              <Pomodoro />
            </div>

            <div className={cn("pt-4 border-t border-[#2A2D31]", !isSidebarOpen && "hidden")}>
              <p className="mono-label mb-4">ANALYTICS</p>
              <div className="h-40 w-full flex items-center justify-center bg-[#151719] rounded-xl border border-[#2A2D31]">
                {stats.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        innerRadius={40}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#151719", border: "1px solid #2A2D31", fontSize: "10px" }}
                        itemStyle={{ color: "#F9F9F9" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="mono-label !text-[9px]">Belum ada data</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-[#2A2D31] flex-shrink-0">
          <div className={cn(!isSidebarOpen && "hidden")}>
            <p className="mono-label mb-2">STATUS</p>
            <div className="text-[32px] font-light leading-none">
                {stats.completed.toString().padStart(2, '0')} / {stats.total.toString().padStart(2, '0')}
            </div>
            <div className="mt-4 h-[1px] bg-[#2A2D31] w-full">
              <div 
                className="h-full bg-[#EB5E28] transition-all duration-500" 
                style={{ width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` }} 
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="pt-12 px-8 md:px-16 flex flex-col md:flex-row md:items-baseline justify-between border-b border-[#2A2D31] pb-8 mb-8 flex-shrink-0">
          <h2 className="huge-header">
            DO.<br /><span className="text-[#EB5E28]">LIST</span>
          </h2>
          <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
             <div className="mono-label">Tugas Aktif</div>
             <div className="text-3xl font-light leading-none">0{stats.active}</div>
          </div>
        </header>

        <div className="max-w-4xl w-full mx-auto px-8 py-8 flex-1">
          <div className="mb-12 flex flex-col gap-8">
            <div className="flex bg-[#151719] border border-[#2A2D31]">
              {(["all", "active", "completed"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex-1 px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all",
                    filter === f
                      ? "bg-white text-black"
                      : "text-[#6A6D71] hover:text-white"
                  )}
                >
                  {f === 'all' ? 'SEMUA' : f === 'active' ? 'AKTIF' : 'SELESAI'}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2A2D31]" size={24} />
              <input
                type="text"
                placeholder="CARI TUGAS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151719] border-b border-[#2A2D31] py-6 pl-16 pr-6 text-2xl font-medium text-white focus:outline-none focus:border-accent transition-all placeholder:text-[#2A2D31]"
              />
            </div>

            <TaskInput onAdd={addTodo} categories={categories} />
          </div>

          <section className="space-y-6 pb-20">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredTodos.length > 0 ? (
                filteredTodos.map((todo) => (
                  <TaskItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onAddSubtasks={addSubtasks}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 text-center"
                >
                  <h3 className="huge-header opacity-5 !text-[60px]">KOSONG</h3>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Footer Bar */}
        <footer className="h-24 bg-[#151719] border-t border-[#2A2D31] flex items-center px-16 justify-between flex-shrink-0 mt-auto">
          <div className="flex items-center gap-6">
            <span className="text-[11px] font-bold text-[#EB5E28] animate-pulse">● MENDENGARKAN</span>
            <span className="mono-label">SIAP MENCATAT PROGRESS...</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

const SidebarItem: React.FC<{
  index: string;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
  small?: boolean;
}> = ({
  index,
  label,
  active,
  onClick,
  collapsed,
  small,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full group flex flex-col items-start transition-all duration-200",
        !active && "opacity-40 hover:opacity-100",
        collapsed && "items-center"
      )}
    >
      <span className="mono-label mb-2">{index}</span>
      {!collapsed && (
        <span className={cn(
          "font-bold text-white transition-colors uppercase whitespace-nowrap",
          active && "text-[#EB5E28]",
          small ? "text-lg" : "text-2xl"
        )}>
          {label}
        </span>
      )}
    </button>
  );
};
