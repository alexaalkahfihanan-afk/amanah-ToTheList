import React, { useState } from "react";
import { Plus, Tag, Flag } from "lucide-react";
import { Priority, PRIORITIES } from "../types";
import { cn } from "../lib/utils";

interface TaskInputProps {
  categories: string[];
  onAdd: (text: string, priority: Priority, category: string) => void;
}

export default function TaskInput({ onAdd, categories }: TaskInputProps) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("sedang");
  const [category, setCategory] = useState<string>(categories[0] || "pribadi");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), priority, category);
    setText("");
    setIsExpanded(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "bg-[#151719] border border-[#2A2D31] overflow-hidden transition-all duration-300",
        isExpanded && "border-accent"
      )}
    >
      <div className="flex items-center px-6 py-4">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value && !isExpanded) setIsExpanded(true);
          }}
          placeholder="LAKUKAN SESUATU..."
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-[#2A2D31] text-2xl font-bold uppercase tracking-tight"
          onFocus={() => setIsExpanded(true)}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="ml-2 px-6 py-3 bg-accent text-[#0F1113] font-black uppercase text-xs tracking-widest disabled:opacity-30 disabled:grayscale hover:brightness-110 transition-all"
        >
          TAMBAH +
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-wrap gap-8 px-6 py-4 bg-[#0F1113]/50 border-t border-[#2A2D31] animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col gap-2">
            <span className="mono-label !text-[9px]">Prioritas</span>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold border uppercase tracking-wider transition-all",
                    priority === p
                      ? "bg-white text-black border-white"
                      : "text-[#6A6D71] border-[#2A2D31] hover:text-white"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="mono-label !text-[9px]">Kategori</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold border uppercase tracking-wider transition-all",
                    category === c
                      ? "bg-accent text-[#0F1113] border-accent"
                      : "text-[#6A6D71] border-[#2A2D31] hover:text-white"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
