import React, { useState } from "react";
import { Check, Trash2, Calendar, Tag, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Todo } from "../types";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { breakdownTask } from "../services/geminiService";

interface TaskItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubtasks?: (parentId: string, texts: string[]) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ todo, onToggle, onDelete, onAddSubtasks }) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleMagic = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    
    setIsLoading(true);
    setIsExpanding(true);
    const result = await breakdownTask(todo.text);
    setSuggestions(result);
    setIsLoading(false);
  };

  const useSuggestions = () => {
    if (onAddSubtasks && suggestions.length > 0) {
      onAddSubtasks(todo.id, suggestions);
      setSuggestions([]);
      setIsExpanding(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group flex flex-col p-6 border-b border-[#2A2D31] transition-all duration-200",
        todo.completed && "opacity-40"
      )}
    >
      <div className="flex items-center gap-8">
        <button
          onClick={() => onToggle(todo.id)}
          className={cn(
            "flex-shrink-0 w-8 h-8 border-2 transition-all duration-200 rounded-full",
            todo.completed
              ? "bg-white border-white"
              : "border-[#EB5E28] hover:bg-[#EB5E28]/10"
          )}
        >
          {todo.completed && <Check size={18} className="text-[#0F1113] mx-auto" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-3xl font-medium leading-tight break-words transition-all duration-200",
              todo.completed && "line-through decoration-1"
            )}
          >
            {todo.text}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="mono-label !text-[10px] text-accent">
              prioritas {todo.priority}
            </span>
            <span className="mono-label !text-[10px]">
              {todo.category}
            </span>
            <span className="mono-label !text-[10px] text-[#4A4D51]">
              {format(todo.createdAt, "HH:mm")}
            </span>
            {!todo.completed && (
              <button 
                onClick={handleMagic}
                className="flex items-center gap-1 mono-label !text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                PECAHKAN TUGAS (AI)
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(todo.id)}
          className="opacity-0 group-hover:opacity-100 p-2 text-[#6A6D71] hover:text-red-500 transition-all"
          aria-label="Delete todo"
        >
          <Trash2 size={24} />
        </button>
      </div>

      <AnimatePresence>
        {isExpanding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 ml-16 p-6 bg-[#151719] border border-[#2A2D31] rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="mono-label">Saran Langkah-langkah AI:</span>
                {!isLoading && suggestions.length > 0 && (
                  <button 
                    onClick={useSuggestions}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded hover:bg-blue-500 transition-all"
                  >
                    TAMBAH KE DAFTAR <ArrowRight size={10} />
                  </button>
                )}
              </div>
              
              {isLoading ? (
                <div className="flex items-center gap-3 py-4 text-[#6A6D71] mono-label">
                  <Loader2 size={16} className="animate-spin" />
                  MENYIAPKAN STRATEGI...
                </div>
              ) : (
                <ul className="space-y-3">
                  {suggestions.map((s, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 text-white font-medium"
                    >
                      <span className="text-accent font-bold mt-1">●</span>
                      {s}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskItem;
